"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient, RealtimeChannel } from "@supabase/supabase-js";

const GAME_TYPE = "tictactoe";
const MAX_RANKINGS = 10;

interface GameRoom {
    id: string;
    room_code: string;
    player_x: string;
    player_o: string | null;
    board: (string | null)[];
    current_turn: string;
    winner: string | null;
    status: "waiting" | "playing" | "finished";
    created_at: string;
    updated_at: string;
}

interface RankingEntry {
    rank: number;
    nickname: string;
    score: number;
    date: string;
}

// Supabase 클라이언트 생성 (브라우저용)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase =
    supabaseUrl && supabaseAnonKey
        ? createClient(supabaseUrl, supabaseAnonKey)
        : null;

// 랭킹 API 호출
async function fetchRankings(): Promise<RankingEntry[]> {
    try {
        const response = await fetch(`/api/rankings?game_type=${GAME_TYPE}`);
        if (!response.ok) return [];
        const data = await response.json();
        return data.rankings || [];
    } catch {
        return [];
    }
}

async function submitRanking(
    nickname: string,
    score: number,
): Promise<{ rankings: RankingEntry[]; newRankPosition: number | null }> {
    try {
        const response = await fetch("/api/rankings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nickname, score, game_type: GAME_TYPE }),
        });
        if (!response.ok) return { rankings: [], newRankPosition: null };
        const data = await response.json();
        return {
            rankings: data.rankings || [],
            newRankPosition: data.newRankPosition || null,
        };
    } catch {
        return { rankings: [], newRankPosition: null };
    }
}

type GameState = "lobby" | "waiting" | "playing" | "finished";

export function TicTacToeGame() {
    const [gameState, setGameState] = useState<GameState>("lobby");
    const [nickname, setNickname] = useState("");
    const [roomCode, setRoomCode] = useState("");
    const [room, setRoom] = useState<GameRoom | null>(null);
    const [myPlayer, setMyPlayer] = useState<"X" | "O" | null>(null);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [rankings, setRankings] = useState<RankingEntry[]>([]);
    const [isLoadingRankings, setIsLoadingRankings] = useState(false);
    const [channel, setChannel] = useState<RealtimeChannel | null>(null);
    const [winCount, setWinCount] = useState(0);

    // 랭킹 로드
    useEffect(() => {
        const loadRankings = async () => {
            setIsLoadingRankings(true);
            const data = await fetchRankings();
            setRankings(data);
            setIsLoadingRankings(false);
        };
        loadRankings();
    }, []);

    // 게임 방 실시간 구독
    useEffect(() => {
        if (!room?.room_code || !supabase) return;

        const newChannel = supabase
            .channel(`room:${room.room_code}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "game_rooms",
                    filter: `room_code=eq.${room.room_code}`,
                },
                (payload) => {
                    const updatedRoom = payload.new as GameRoom;
                    setRoom(updatedRoom);

                    if (updatedRoom.status === "playing") {
                        setGameState("playing");
                    } else if (updatedRoom.status === "finished") {
                        setGameState("finished");
                    }
                },
            )
            .subscribe();

        setChannel(newChannel);

        return () => {
            newChannel.unsubscribe();
        };
    }, [room?.room_code]);

    // 방 생성
    const handleCreateRoom = useCallback(async () => {
        if (!nickname.trim()) {
            setError("닉네임을 입력해주세요");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const response = await fetch("/api/games", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "create",
                    nickname: nickname.trim(),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "방 생성 실패");
                return;
            }

            setRoom(data.room);
            setMyPlayer(data.player);
            setGameState("waiting");
        } catch {
            setError("방 생성 중 오류 발생");
        } finally {
            setIsLoading(false);
        }
    }, [nickname]);

    // 방 참가
    const handleJoinRoom = useCallback(async () => {
        if (!nickname.trim()) {
            setError("닉네임을 입력해주세요");
            return;
        }
        if (!roomCode.trim()) {
            setError("방 코드를 입력해주세요");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const response = await fetch("/api/games", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "join",
                    nickname: nickname.trim(),
                    room_code: roomCode.trim(),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "방 참가 실패");
                return;
            }

            setRoom(data.room);
            setMyPlayer(data.player);
            setGameState("playing");
        } catch {
            setError("방 참가 중 오류 발생");
        } finally {
            setIsLoading(false);
        }
    }, [nickname, roomCode]);

    // 수 두기
    const handleMove = useCallback(
        async (position: number) => {
            if (!room || !myPlayer) return;
            if (room.status !== "playing") return;
            if (room.current_turn !== myPlayer) return;
            if (room.board[position] !== null) return;

            try {
                const response = await fetch("/api/games", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        room_code: room.room_code,
                        position,
                        player: myPlayer,
                    }),
                });

                const data = await response.json();

                if (response.ok) {
                    setRoom(data.room);

                    if (data.room.status === "finished") {
                        setGameState("finished");

                        // 승리 시 랭킹에 점수 추가
                        if (data.room.winner === myPlayer) {
                            const newWinCount = winCount + 1;
                            setWinCount(newWinCount);

                            // 승리 점수 = 승리 횟수 * 100
                            const result = await submitRanking(
                                nickname,
                                newWinCount * 100,
                            );
                            if (result.rankings.length > 0) {
                                setRankings(result.rankings);
                            }
                        }
                    }
                }
            } catch (e) {
                console.error("Move failed:", e);
            }
        },
        [room, myPlayer, nickname, winCount],
    );

    // 새 게임
    const handleNewGame = useCallback(() => {
        if (channel) {
            channel.unsubscribe();
        }
        setRoom(null);
        setMyPlayer(null);
        setRoomCode("");
        setGameState("lobby");
        setError("");
    }, [channel]);

    // 렌더링
    const renderBoard = () => {
        if (!room) return null;

        return (
            <div className="grid grid-cols-3 gap-2 w-64 h-64">
                {room.board.map((cell, index) => (
                    <button
                        key={index}
                        onClick={() => handleMove(index)}
                        disabled={
                            room.status !== "playing" ||
                            room.current_turn !== myPlayer ||
                            cell !== null
                        }
                        className={`
                            w-20 h-20 text-4xl font-bold rounded-lg
                            ${cell === null ? "bg-gray-100 hover:bg-gray-200" : "bg-white"}
                            ${cell === "X" ? "text-blue-500" : "text-red-500"}
                            ${room.current_turn === myPlayer && cell === null ? "cursor-pointer" : "cursor-not-allowed"}
                            border-2 border-gray-300
                            transition-colors
                        `}
                    >
                        {cell}
                    </button>
                ))}
            </div>
        );
    };

    const getStatusMessage = () => {
        if (!room) return "";

        if (room.status === "finished") {
            if (room.winner === "draw") {
                return "무승부!";
            }
            if (room.winner === myPlayer) {
                return "승리! 🎉";
            }
            return "패배...";
        }

        if (room.current_turn === myPlayer) {
            return "당신의 차례입니다";
        }
        return "상대방 차례입니다...";
    };

    return (
        <div className="flex flex-col md:flex-row items-start justify-center gap-6">
            {/* 게임 영역 */}
            <div className="flex flex-col items-center min-w-[280px]">
                {gameState === "lobby" && (
                    <div className="flex flex-col gap-4 w-64">
                        <h3 className="text-lg font-bold text-gray-800 text-center">
                            틱택토 대전
                        </h3>

                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) =>
                                setNickname(e.target.value.slice(0, 10))
                            }
                            placeholder="닉네임 (최대 10자)"
                            className="px-3 py-2 border rounded text-center"
                        />

                        <button
                            onClick={handleCreateRoom}
                            disabled={isLoading}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-bold disabled:bg-gray-400"
                        >
                            {isLoading ? "생성 중..." : "방 만들기"}
                        </button>

                        <div className="flex items-center gap-2">
                            <div className="flex-1 h-px bg-gray-300"></div>
                            <span className="text-gray-500 text-sm">또는</span>
                            <div className="flex-1 h-px bg-gray-300"></div>
                        </div>

                        <input
                            type="text"
                            value={roomCode}
                            onChange={(e) =>
                                setRoomCode(e.target.value.toUpperCase())
                            }
                            placeholder="방 코드 입력"
                            className="px-3 py-2 border rounded text-center uppercase"
                            maxLength={4}
                        />

                        <button
                            onClick={handleJoinRoom}
                            disabled={isLoading}
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded font-bold disabled:bg-gray-400"
                        >
                            {isLoading ? "참가 중..." : "방 참가하기"}
                        </button>

                        {error && (
                            <p className="text-red-500 text-sm text-center">
                                {error}
                            </p>
                        )}
                    </div>
                )}

                {gameState === "waiting" && room && (
                    <div className="flex flex-col items-center gap-4">
                        <h3 className="text-lg font-bold text-gray-800">
                            대기 중...
                        </h3>
                        <div className="bg-yellow-100 px-6 py-4 rounded-lg text-center">
                            <p className="text-sm text-gray-600 mb-2">
                                방 코드를 공유하세요:
                            </p>
                            <p className="text-3xl font-mono font-bold text-yellow-700">
                                {room.room_code}
                            </p>
                        </div>
                        <p className="text-gray-500">상대방을 기다리는 중...</p>
                        <div className="animate-pulse flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        </div>
                        <button
                            onClick={handleNewGame}
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700"
                        >
                            취소
                        </button>
                    </div>
                )}

                {(gameState === "playing" || gameState === "finished") &&
                    room && (
                        <div className="flex flex-col items-center gap-4">
                            <div className="flex justify-between w-full text-sm">
                                <span className="text-blue-500 font-bold">
                                    X: {room.player_x}
                                    {myPlayer === "X" && " (나)"}
                                </span>
                                <span className="text-red-500 font-bold">
                                    O: {room.player_o}
                                    {myPlayer === "O" && " (나)"}
                                </span>
                            </div>

                            {renderBoard()}

                            <p
                                className={`font-bold ${
                                    room.winner === myPlayer
                                        ? "text-green-500"
                                        : room.winner === "draw"
                                          ? "text-yellow-500"
                                          : room.status === "finished"
                                            ? "text-red-500"
                                            : "text-gray-700"
                                }`}
                            >
                                {getStatusMessage()}
                            </p>

                            {gameState === "finished" && (
                                <button
                                    onClick={handleNewGame}
                                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-bold"
                                >
                                    새 게임
                                </button>
                            )}
                        </div>
                    )}
            </div>

            {/* 랭킹 보드 */}
            <div className="bg-gray-800 rounded-lg p-4 min-w-[200px]">
                <h3 className="text-yellow-400 font-bold text-lg mb-3 flex items-center gap-2">
                    <span>🏆</span> 승리 랭킹 TOP 10
                </h3>
                {isLoadingRankings ? (
                    <p className="text-gray-400 text-sm">랭킹 불러오는 중...</p>
                ) : rankings.length === 0 ? (
                    <p className="text-gray-400 text-sm">
                        아직 기록이 없습니다
                    </p>
                ) : (
                    <div className="space-y-2">
                        {rankings.map((entry, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between text-sm px-2 py-1"
                            >
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`w-6 font-bold ${
                                            entry.rank === 1
                                                ? "text-yellow-400"
                                                : entry.rank === 2
                                                  ? "text-gray-300"
                                                  : entry.rank === 3
                                                    ? "text-amber-600"
                                                    : "text-gray-500"
                                        }`}
                                    >
                                        {entry.rank}.
                                    </span>
                                    <span className="text-white truncate max-w-[80px]">
                                        {entry.nickname}
                                    </span>
                                </div>
                                <span className="text-green-400 font-mono">
                                    {entry.score}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
                <div className="mt-4 pt-3 border-t border-gray-600">
                    <p className="text-gray-400 text-xs">
                        점수 = 승리 횟수 × 100
                    </p>
                </div>
            </div>
        </div>
    );
}
