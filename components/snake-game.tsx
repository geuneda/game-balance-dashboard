"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;

type Position = { x: number; y: number };
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

export function SnakeGame() {
    const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
    const [food, setFood] = useState<Position>({ x: 15, y: 15 });
    const [direction, setDirection] = useState<Direction>("RIGHT");
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const directionRef = useRef<Direction>("RIGHT");

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
    }, [generateFood]);

    const moveSnake = useCallback(() => {
        if (gameOver || !isPlaying) return;

        setSnake((prevSnake) => {
            const head = { ...prevSnake[0] };
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
                setGameOver(true);
                setIsPlaying(false);
                return prevSnake;
            }

            // 자기 몸 충돌 체크
            if (prevSnake.some((s) => s.x === head.x && s.y === head.y)) {
                setGameOver(true);
                setIsPlaying(false);
                return prevSnake;
            }

            const newSnake = [head, ...prevSnake];

            // 음식 먹기
            if (head.x === food.x && head.y === food.y) {
                setScore((s) => s + 10);
                setFood(generateFood(newSnake));
            } else {
                newSnake.pop();
            }

            return newSnake;
        });
    }, [food, gameOver, isPlaying, generateFood]);

    // 게임 루프
    useEffect(() => {
        if (!isPlaying) return;
        const interval = setInterval(moveSnake, INITIAL_SPEED);
        return () => clearInterval(interval);
    }, [isPlaying, moveSnake]);

    // 키보드 입력
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isPlaying && !gameOver && e.key.startsWith("Arrow")) {
                setIsPlaying(true);
            }

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
    }, [isPlaying, gameOver]);

    return (
        <div className="flex flex-col items-center">
            <div
                className="relative border-2 border-gray-800 bg-gray-900"
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

                {/* 게임 오버 또는 시작 화면 */}
                {(!isPlaying || gameOver) && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
                        <p className="text-white text-xl font-bold mb-2">
                            {gameOver ? "Game Over!" : "🐍 Snake Game"}
                        </p>
                        <p className="text-white mb-4">
                            {gameOver ? `점수: ${score}` : "방향키로 시작"}
                        </p>
                        {gameOver && (
                            <button
                                onClick={resetGame}
                                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded font-bold"
                            >
                                다시 시작
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div className="mt-4 text-lg font-bold text-gray-700">
                점수: {score}
            </div>
        </div>
    );
}
