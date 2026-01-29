"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;
const MIN_SPEED = 60;
const SPEED_DECREASE_PER_FOOD = 5;
const MAX_RANKINGS = 10;
const STORAGE_KEY = "snake-game-rankings";

type Position = { x: number; y: number };
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

interface RankingEntry {
    rank: number;
    nickname: string;
    score: number;
    date: string;
}

// 랭킹 관련 함수들
function loadRankings(): RankingEntry[] {
    if (typeof window === "undefined") return [];
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch {
        console.error("Failed to load rankings");
    }
    return [];
}

function saveRankings(rankings: RankingEntry[]): void {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(rankings));
    } catch {
        console.error("Failed to save rankings");
    }
}

function isRankingEntry(score: number, rankings: RankingEntry[]): boolean {
    if (score === 0) return false;
    if (rankings.length < MAX_RANKINGS) return true;
    return score > rankings[rankings.length - 1].score;
}

function addToRanking(
    nickname: string,
    score: number,
    rankings: RankingEntry[],
): RankingEntry[] {
    const newEntry: RankingEntry = {
        rank: 0,
        nickname: nickname.trim() || "익명",
        score,
        date: new Date().toLocaleDateString("ko-KR"),
    };

    const newRankings = [...rankings, newEntry]
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_RANKINGS)
        .map((entry, index) => ({ ...entry, rank: index + 1 }));

    saveRankings(newRankings);
    return newRankings;
}

// 속도 계산 함수
function calculateSpeed(score: number): number {
    const foodsEaten = Math.floor(score / 10);
    const speed = INITIAL_SPEED - foodsEaten * SPEED_DECREASE_PER_FOOD;
    return Math.max(speed, MIN_SPEED);
}

// 레벨 계산 함수
function calculateLevel(score: number): number {
    return Math.floor(score / 50) + 1;
}

export function SnakeGame() {
    const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
    const [food, setFood] = useState<Position>({ x: 15, y: 15 });
    const [direction, setDirection] = useState<Direction>("RIGHT");
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [rankings, setRankings] = useState<RankingEntry[]>([]);
    const [showNicknameInput, setShowNicknameInput] = useState(false);
    const [nickname, setNickname] = useState("");
    const [newRankPosition, setNewRankPosition] = useState<number | null>(null);

    const directionRef = useRef<Direction>("RIGHT");
    const lastMoveTimeRef = useRef<number>(0);
    const animationFrameRef = useRef<number | null>(null);
    const gameContainerRef = useRef<HTMLDivElement>(null);
    const touchStartRef = useRef<{ x: number; y: number } | null>(null);

    // 랭킹 로드
    useEffect(() => {
        setRankings(loadRankings());
    }, []);

    const generateFood = useCallback((currentSnake: Position[]): Position => {
        let newFood: Position;
        do {
            newFood = {
                x: Math.floor(Math.random() * GRID_SIZE),
                y: Math.floor(Math.random() * GRID_SIZE),
            };
        } while (
            currentSnake.some((s) => s.x === newFood.x && s.y === newFood.y)
        );
        return newFood;
    }, []);

    const resetGame = useCallback(() => {
        const initialSnake = [{ x: 10, y: 10 }];
        setSnake(initialSnake);
        setFood(generateFood(initialSnake));
        setDirection("RIGHT");
        directionRef.current = "RIGHT";
        setGameOver(false);
        setScore(0);
        setIsPlaying(true);
        setIsPaused(false);
        setShowNicknameInput(false);
        setNickname("");
        setNewRankPosition(null);
        lastMoveTimeRef.current = 0;
    }, [generateFood]);

    // 게임 오버 시 랭킹 체크
    useEffect(() => {
        if (gameOver && score > 0) {
            const currentRankings = loadRankings();
            if (isRankingEntry(score, currentRankings)) {
                setShowNicknameInput(true);
            }
        }
    }, [gameOver, score]);

    // 닉네임 제출 핸들러
    const handleNicknameSubmit = useCallback(() => {
        const currentRankings = loadRankings();
        const newRankings = addToRanking(nickname, score, currentRankings);
        setRankings(newRankings);
        const position = newRankings.findIndex((r) => r.score === score);
        setNewRankPosition(position !== -1 ? position + 1 : null);
        setShowNicknameInput(false);
    }, [nickname, score]);

    const moveSnake = useCallback(
        (currentSnake: Position[], currentFood: Position) => {
            const head = { ...currentSnake[0] };
            const currentDir = directionRef.current;

            switch (currentDir) {
                case "UP":
                    head.y -= 1;
                    break;
                case "DOWN":
                    head.y += 1;
                    break;
                case "LEFT":
                    head.x -= 1;
                    break;
                case "RIGHT":
                    head.x += 1;
                    break;
            }

            // 벽 충돌 체크
            if (
                head.x < 0 ||
                head.x >= GRID_SIZE ||
                head.y < 0 ||
                head.y >= GRID_SIZE
            ) {
                return {
                    collision: true,
                    newSnake: currentSnake,
                    ateFood: false,
                };
            }

            // 자기 몸 충돌 체크
            if (currentSnake.some((s) => s.x === head.x && s.y === head.y)) {
                return {
                    collision: true,
                    newSnake: currentSnake,
                    ateFood: false,
                };
            }

            const newSnake = [head, ...currentSnake];
            const ateFood =
                head.x === currentFood.x && head.y === currentFood.y;

            if (!ateFood) {
                newSnake.pop();
            }

            return { collision: false, newSnake, ateFood };
        },
        [],
    );

    // requestAnimationFrame 기반 게임 루프
    useEffect(() => {
        if (!isPlaying || gameOver || isPaused) {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
            return;
        }

        const gameLoop = (timestamp: number) => {
            const speed = calculateSpeed(score);
            const elapsed = timestamp - lastMoveTimeRef.current;

            if (elapsed >= speed) {
                lastMoveTimeRef.current = timestamp;

                setSnake((prevSnake) => {
                    const result = moveSnake(prevSnake, food);

                    if (result.collision) {
                        setGameOver(true);
                        setIsPlaying(false);
                        return prevSnake;
                    }

                    if (result.ateFood) {
                        setScore((s) => s + 10);
                        setFood(generateFood(result.newSnake));
                    }

                    return result.newSnake;
                });
            }

            animationFrameRef.current = requestAnimationFrame(gameLoop);
        };

        animationFrameRef.current = requestAnimationFrame(gameLoop);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isPlaying, gameOver, isPaused, food, score, moveSnake, generateFood]);

    // 키보드 입력
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // 닉네임 입력 중에는 방향키 무시
            if (showNicknameInput) return;

            // 스페이스바: 일시정지/재개
            if (e.key === " " || e.code === "Space") {
                e.preventDefault();
                if (isPlaying && !gameOver) {
                    setIsPaused((prev) => !prev);
                }
                return;
            }

            // 게임 시작
            if (!isPlaying && !gameOver && e.key.startsWith("Arrow")) {
                setIsPlaying(true);
                lastMoveTimeRef.current = performance.now();
            }

            // 일시정지 중에는 방향 변경 무시
            if (isPaused) return;

            const currentDir = directionRef.current;

            switch (e.key) {
                case "ArrowUp":
                    if (currentDir !== "DOWN") {
                        setDirection("UP");
                        directionRef.current = "UP";
                    }
                    break;
                case "ArrowDown":
                    if (currentDir !== "UP") {
                        setDirection("DOWN");
                        directionRef.current = "DOWN";
                    }
                    break;
                case "ArrowLeft":
                    if (currentDir !== "RIGHT") {
                        setDirection("LEFT");
                        directionRef.current = "LEFT";
                    }
                    break;
                case "ArrowRight":
                    if (currentDir !== "LEFT") {
                        setDirection("RIGHT");
                        directionRef.current = "RIGHT";
                    }
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isPlaying, gameOver, isPaused, showNicknameInput]);

    // 모바일 터치 스와이프
    useEffect(() => {
        const container = gameContainerRef.current;
        if (!container) return;

        const handleTouchStart = (e: TouchEvent) => {
            const touch = e.touches[0];
            touchStartRef.current = { x: touch.clientX, y: touch.clientY };
        };

        const handleTouchEnd = (e: TouchEvent) => {
            if (!touchStartRef.current) return;
            if (showNicknameInput) return;

            const touch = e.changedTouches[0];
            const deltaX = touch.clientX - touchStartRef.current.x;
            const deltaY = touch.clientY - touchStartRef.current.y;

            const minSwipeDistance = 30;

            if (
                Math.abs(deltaX) < minSwipeDistance &&
                Math.abs(deltaY) < minSwipeDistance
            ) {
                touchStartRef.current = null;
                return;
            }

            // 게임 시작
            if (!isPlaying && !gameOver) {
                setIsPlaying(true);
                lastMoveTimeRef.current = performance.now();
            }

            if (isPaused) {
                touchStartRef.current = null;
                return;
            }

            const currentDir = directionRef.current;

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // 가로 스와이프
                if (deltaX > 0 && currentDir !== "LEFT") {
                    setDirection("RIGHT");
                    directionRef.current = "RIGHT";
                } else if (deltaX < 0 && currentDir !== "RIGHT") {
                    setDirection("LEFT");
                    directionRef.current = "LEFT";
                }
            } else {
                // 세로 스와이프
                if (deltaY > 0 && currentDir !== "UP") {
                    setDirection("DOWN");
                    directionRef.current = "DOWN";
                } else if (deltaY < 0 && currentDir !== "DOWN") {
                    setDirection("UP");
                    directionRef.current = "UP";
                }
            }

            touchStartRef.current = null;
        };

        container.addEventListener("touchstart", handleTouchStart, {
            passive: true,
        });
        container.addEventListener("touchend", handleTouchEnd, {
            passive: true,
        });

        return () => {
            container.removeEventListener("touchstart", handleTouchStart);
            container.removeEventListener("touchend", handleTouchEnd);
        };
    }, [isPlaying, gameOver, isPaused, showNicknameInput]);

    const currentLevel = calculateLevel(score);
    const currentSpeed = calculateSpeed(score);

    return (
        <div className="flex flex-col md:flex-row items-start justify-center gap-6">
            {/* 게임 영역 */}
            <div className="flex flex-col items-center">
                <div
                    ref={gameContainerRef}
                    className="relative border-2 border-gray-800 bg-gray-900 touch-none"
                    style={{
                        width: GRID_SIZE * CELL_SIZE,
                        height: GRID_SIZE * CELL_SIZE,
                    }}
                >
                    {/* 뱀 */}
                    {snake.map((segment, index) => (
                        <div
                            key={index}
                            className={`absolute rounded-sm ${
                                index === 0 ? "bg-green-400" : "bg-green-500"
                            }`}
                            style={{
                                width: CELL_SIZE - 2,
                                height: CELL_SIZE - 2,
                                left: segment.x * CELL_SIZE + 1,
                                top: segment.y * CELL_SIZE + 1,
                            }}
                        />
                    ))}

                    {/* 음식 */}
                    <div
                        className="absolute bg-red-500 rounded-full"
                        style={{
                            width: CELL_SIZE - 4,
                            height: CELL_SIZE - 4,
                            left: food.x * CELL_SIZE + 2,
                            top: food.y * CELL_SIZE + 2,
                        }}
                    />

                    {/* 일시정지 화면 */}
                    {isPaused && isPlaying && !gameOver && (
                        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
                            <p className="text-white text-xl font-bold mb-2">
                                일시정지
                            </p>
                            <p className="text-white text-sm">
                                스페이스바로 계속
                            </p>
                        </div>
                    )}

                    {/* 게임 오버 또는 시작 화면 */}
                    {(!isPlaying || gameOver) && !isPaused && (
                        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-4">
                            {showNicknameInput ? (
                                <>
                                    <p className="text-yellow-400 text-lg font-bold mb-2">
                                        랭킹 진입!
                                    </p>
                                    <p className="text-white mb-3">
                                        점수: {score}
                                    </p>
                                    <input
                                        type="text"
                                        value={nickname}
                                        onChange={(e) =>
                                            setNickname(
                                                e.target.value.slice(0, 10),
                                            )
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                handleNicknameSubmit();
                                            }
                                        }}
                                        placeholder="닉네임 (최대 10자)"
                                        className="px-3 py-2 rounded text-black mb-3 w-40 text-center"
                                        autoFocus
                                    />
                                    <button
                                        onClick={handleNicknameSubmit}
                                        className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded font-bold"
                                    >
                                        등록
                                    </button>
                                </>
                            ) : (
                                <>
                                    <p className="text-white text-xl font-bold mb-2">
                                        {gameOver ? "Game Over!" : "Snake Game"}
                                    </p>
                                    {gameOver && newRankPosition && (
                                        <p className="text-yellow-400 mb-1">
                                            {newRankPosition}위 달성!
                                        </p>
                                    )}
                                    <p className="text-white mb-4">
                                        {gameOver
                                            ? `점수: ${score}`
                                            : "방향키 또는 스와이프로 시작"}
                                    </p>
                                    {gameOver ? (
                                        <button
                                            onClick={resetGame}
                                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded font-bold"
                                        >
                                            다시 시작
                                        </button>
                                    ) : (
                                        <p className="text-gray-400 text-xs">
                                            스페이스바: 일시정지
                                        </p>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* 점수 및 레벨 표시 */}
                <div className="mt-4 flex gap-6 text-lg font-bold text-gray-700">
                    <span>점수: {score}</span>
                    <span>레벨: {currentLevel}</span>
                    <span className="text-sm text-gray-500">
                        ({currentSpeed}ms)
                    </span>
                </div>
            </div>

            {/* 랭킹 보드 */}
            <div className="bg-gray-800 rounded-lg p-4 min-w-[200px]">
                <h3 className="text-yellow-400 font-bold text-lg mb-3 flex items-center gap-2">
                    <span>🏆</span> 랭킹 TOP 10
                </h3>
                {rankings.length === 0 ? (
                    <p className="text-gray-400 text-sm">
                        아직 기록이 없습니다
                    </p>
                ) : (
                    <div className="space-y-2">
                        {rankings.map((entry, index) => (
                            <div
                                key={index}
                                className={`flex items-center justify-between text-sm ${
                                    newRankPosition === entry.rank
                                        ? "bg-yellow-500/20 rounded px-2 py-1"
                                        : "px-2 py-1"
                                }`}
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
                        기록: {rankings.length}/{MAX_RANKINGS}
                    </p>
                </div>
            </div>
        </div>
    );
}
