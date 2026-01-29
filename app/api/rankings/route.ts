import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured, RankingRow } from "@/lib/supabase";

const MAX_RANKINGS = 10;

export interface RankingEntry {
    rank: number;
    nickname: string;
    score: number;
    date: string;
}

// GET: 랭킹 목록 조회
export async function GET(request: NextRequest) {
    if (!isSupabaseConfigured || !supabase) {
        return NextResponse.json(
            { error: "Database not configured", rankings: [] },
            { status: 503 },
        );
    }

    try {
        // game_type 파라미터 추출 (기본값: snake)
        const { searchParams } = new URL(request.url);
        const gameType = searchParams.get("game_type") || "snake";

        const { data, error } = await supabase
            .from("rankings")
            .select("*")
            .eq("game_type", gameType)
            .order("score", { ascending: false })
            .limit(MAX_RANKINGS);

        if (error) {
            console.error("Failed to fetch rankings:", error);
            return NextResponse.json(
                { error: "Failed to fetch rankings" },
                { status: 500 },
            );
        }

        const rankings: RankingEntry[] = (data as RankingRow[]).map(
            (row, index) => ({
                rank: index + 1,
                nickname: row.nickname,
                score: row.score,
                date: new Date(row.created_at).toLocaleDateString("ko-KR"),
            }),
        );

        return NextResponse.json({ rankings });
    } catch (error) {
        console.error("Error fetching rankings:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}

// POST: 새 랭킹 등록
export async function POST(request: NextRequest) {
    if (!isSupabaseConfigured || !supabase) {
        return NextResponse.json(
            { error: "Database not configured", success: false },
            { status: 503 },
        );
    }

    try {
        const body = await request.json();
        const { nickname, score, game_type = "snake" } = body;

        // 유효성 검사
        if (typeof nickname !== "string" || typeof score !== "number") {
            return NextResponse.json(
                { error: "Invalid request body" },
                { status: 400 },
            );
        }

        if (score <= 0) {
            return NextResponse.json(
                { error: "Score must be positive" },
                { status: 400 },
            );
        }

        const trimmedNickname = nickname.trim().slice(0, 10) || "익명";

        // 현재 최저 랭킹 점수 확인 (해당 게임 타입만)
        const { data: currentRankings, error: fetchError } = await supabase
            .from("rankings")
            .select("score")
            .eq("game_type", game_type)
            .order("score", { ascending: false })
            .limit(MAX_RANKINGS);

        if (fetchError) {
            console.error("Failed to fetch current rankings:", fetchError);
            return NextResponse.json(
                { error: "Failed to check rankings" },
                { status: 500 },
            );
        }

        // 랭킹에 들어갈 수 있는지 확인
        const canEnterRanking =
            currentRankings.length < MAX_RANKINGS ||
            score > currentRankings[currentRankings.length - 1].score;

        if (!canEnterRanking) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Score not high enough for ranking",
                },
                { status: 200 },
            );
        }

        // 새 기록 추가 (game_type 포함)
        const { error: insertError } = await supabase.from("rankings").insert({
            nickname: trimmedNickname,
            score: score,
            game_type: game_type,
        });

        if (insertError) {
            console.error("Failed to insert ranking:", insertError);
            return NextResponse.json(
                { error: "Failed to save ranking" },
                { status: 500 },
            );
        }

        // 해당 게임 타입의 랭킹이 MAX_RANKINGS를 초과하면 가장 낮은 점수 삭제
        if (currentRankings.length >= MAX_RANKINGS) {
            // 현재 TOP 10 + 새로 추가된 것 중에서 11위 이하 삭제
            const { data: allRankings, error: allError } = await supabase
                .from("rankings")
                .select("id, score")
                .eq("game_type", game_type)
                .order("score", { ascending: false });

            if (!allError && allRankings && allRankings.length > MAX_RANKINGS) {
                const idsToDelete = allRankings
                    .slice(MAX_RANKINGS)
                    .map((r) => r.id);

                await supabase.from("rankings").delete().in("id", idsToDelete);
            }
        }

        // 업데이트된 랭킹 반환
        const { data: updatedRankings, error: updateError } = await supabase
            .from("rankings")
            .select("*")
            .eq("game_type", game_type)
            .order("score", { ascending: false })
            .limit(MAX_RANKINGS);

        if (updateError) {
            return NextResponse.json(
                { success: true, message: "Ranking saved" },
                { status: 200 },
            );
        }

        const rankings: RankingEntry[] = (updatedRankings as RankingRow[]).map(
            (row, index) => ({
                rank: index + 1,
                nickname: row.nickname,
                score: row.score,
                date: new Date(row.created_at).toLocaleDateString("ko-KR"),
            }),
        );

        // 새로 등록된 랭킹 위치 찾기
        const newRankPosition =
            rankings.findIndex(
                (r) => r.nickname === trimmedNickname && r.score === score,
            ) + 1;

        return NextResponse.json({
            success: true,
            rankings,
            newRankPosition: newRankPosition || null,
        });
    } catch (error) {
        console.error("Error saving ranking:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
