import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured, GameRoomRow } from "@/lib/supabase";

// 4자리 랜덤 방 코드 생성
function generateRoomCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 혼동하기 쉬운 문자 제외
    let code = "";
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// 승자 확인 함수
function checkWinner(board: (string | null)[]): string | null {
    const winPatterns = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8], // 가로
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8], // 세로
        [0, 4, 8],
        [2, 4, 6], // 대각선
    ];

    for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }

    // 무승부 확인
    if (board.every((cell) => cell !== null)) {
        return "draw";
    }

    return null;
}

// GET: 게임 방 조회
export async function GET(request: NextRequest) {
    if (!isSupabaseConfigured || !supabase) {
        return NextResponse.json(
            { error: "Database not configured" },
            { status: 503 },
        );
    }

    try {
        const { searchParams } = new URL(request.url);
        const roomCode = searchParams.get("code");

        if (!roomCode) {
            return NextResponse.json(
                { error: "Room code is required" },
                { status: 400 },
            );
        }

        const { data, error } = await supabase
            .from("game_rooms")
            .select("*")
            .eq("room_code", roomCode.toUpperCase())
            .single();

        if (error || !data) {
            return NextResponse.json(
                { error: "Room not found" },
                { status: 404 },
            );
        }

        return NextResponse.json({ room: data as GameRoomRow });
    } catch (error) {
        console.error("Error fetching game room:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}

// POST: 게임 방 생성 또는 참가
export async function POST(request: NextRequest) {
    if (!isSupabaseConfigured || !supabase) {
        return NextResponse.json(
            { error: "Database not configured" },
            { status: 503 },
        );
    }

    try {
        const body = await request.json();
        const { action, nickname, room_code } = body;

        if (!nickname || typeof nickname !== "string") {
            return NextResponse.json(
                { error: "Nickname is required" },
                { status: 400 },
            );
        }

        const trimmedNickname = nickname.trim().slice(0, 10) || "익명";

        // 방 생성
        if (action === "create") {
            // 고유한 방 코드 생성
            let code = generateRoomCode();
            let attempts = 0;
            const maxAttempts = 10;

            while (attempts < maxAttempts) {
                const { data: existing } = await supabase
                    .from("game_rooms")
                    .select("id")
                    .eq("room_code", code)
                    .single();

                if (!existing) break;
                code = generateRoomCode();
                attempts++;
            }

            const { data, error } = await supabase
                .from("game_rooms")
                .insert({
                    room_code: code,
                    player_x: trimmedNickname,
                    status: "waiting",
                })
                .select()
                .single();

            if (error) {
                console.error("Failed to create room:", error);
                return NextResponse.json(
                    { error: "Failed to create room" },
                    { status: 500 },
                );
            }

            return NextResponse.json({
                success: true,
                room: data as GameRoomRow,
                player: "X",
            });
        }

        // 방 참가
        if (action === "join") {
            if (!room_code) {
                return NextResponse.json(
                    { error: "Room code is required" },
                    { status: 400 },
                );
            }

            const upperCode = room_code.toUpperCase();

            // 방 조회
            const { data: room, error: fetchError } = await supabase
                .from("game_rooms")
                .select("*")
                .eq("room_code", upperCode)
                .single();

            if (fetchError || !room) {
                return NextResponse.json(
                    { error: "Room not found" },
                    { status: 404 },
                );
            }

            if (room.status !== "waiting") {
                return NextResponse.json(
                    { error: "Game already in progress or finished" },
                    { status: 400 },
                );
            }

            if (room.player_o) {
                return NextResponse.json(
                    { error: "Room is full" },
                    { status: 400 },
                );
            }

            // 참가자로 등록하고 게임 시작
            const { data, error: updateError } = await supabase
                .from("game_rooms")
                .update({
                    player_o: trimmedNickname,
                    status: "playing",
                    updated_at: new Date().toISOString(),
                })
                .eq("room_code", upperCode)
                .select()
                .single();

            if (updateError) {
                console.error("Failed to join room:", updateError);
                return NextResponse.json(
                    { error: "Failed to join room" },
                    { status: 500 },
                );
            }

            return NextResponse.json({
                success: true,
                room: data as GameRoomRow,
                player: "O",
            });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error) {
        console.error("Error in game room operation:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}

// PATCH: 게임 진행 (움직임)
export async function PATCH(request: NextRequest) {
    if (!isSupabaseConfigured || !supabase) {
        return NextResponse.json(
            { error: "Database not configured" },
            { status: 503 },
        );
    }

    try {
        const body = await request.json();
        const { room_code, position, player } = body;

        if (!room_code || position === undefined || !player) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 },
            );
        }

        if (position < 0 || position > 8) {
            return NextResponse.json(
                { error: "Invalid position" },
                { status: 400 },
            );
        }

        if (player !== "X" && player !== "O") {
            return NextResponse.json(
                { error: "Invalid player" },
                { status: 400 },
            );
        }

        // 현재 게임 상태 조회
        const { data: room, error: fetchError } = await supabase
            .from("game_rooms")
            .select("*")
            .eq("room_code", room_code.toUpperCase())
            .single();

        if (fetchError || !room) {
            return NextResponse.json(
                { error: "Room not found" },
                { status: 404 },
            );
        }

        if (room.status !== "playing") {
            return NextResponse.json(
                { error: "Game is not in progress" },
                { status: 400 },
            );
        }

        if (room.current_turn !== player) {
            return NextResponse.json(
                { error: "Not your turn" },
                { status: 400 },
            );
        }

        const board = [...room.board];
        if (board[position] !== null) {
            return NextResponse.json(
                { error: "Position already taken" },
                { status: 400 },
            );
        }

        // 움직임 적용
        board[position] = player;

        // 승자 확인
        const winner = checkWinner(board);
        const nextTurn = player === "X" ? "O" : "X";

        const updateData: {
            board: (string | null)[];
            current_turn: string;
            updated_at: string;
            winner?: string;
            status?: string;
        } = {
            board,
            current_turn: nextTurn,
            updated_at: new Date().toISOString(),
        };

        if (winner) {
            updateData.winner = winner;
            updateData.status = "finished";
        }

        const { data, error: updateError } = await supabase
            .from("game_rooms")
            .update(updateData)
            .eq("room_code", room_code.toUpperCase())
            .select()
            .single();

        if (updateError) {
            console.error("Failed to update game:", updateError);
            return NextResponse.json(
                { error: "Failed to update game" },
                { status: 500 },
            );
        }

        return NextResponse.json({
            success: true,
            room: data as GameRoomRow,
        });
    } catch (error) {
        console.error("Error updating game:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}

// DELETE: 게임 방 삭제 (정리용)
export async function DELETE(request: NextRequest) {
    if (!isSupabaseConfigured || !supabase) {
        return NextResponse.json(
            { error: "Database not configured" },
            { status: 503 },
        );
    }

    try {
        const { searchParams } = new URL(request.url);
        const roomCode = searchParams.get("code");

        if (!roomCode) {
            return NextResponse.json(
                { error: "Room code is required" },
                { status: 400 },
            );
        }

        const { error } = await supabase
            .from("game_rooms")
            .delete()
            .eq("room_code", roomCode.toUpperCase());

        if (error) {
            console.error("Failed to delete room:", error);
            return NextResponse.json(
                { error: "Failed to delete room" },
                { status: 500 },
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting room:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
