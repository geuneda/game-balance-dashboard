"use client";

import { useState, useEffect } from "react";
import useKonami from "use-konami";
import { SnakeGame } from "./snake-game";
import { TicTacToeGame } from "./tictactoe-game";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";

export function EasterEggGame() {
    const [showGame, setShowGame] = useState(false);

    useKonami({
        onUnlock: () => setShowGame(true),
        sequence: [
            "ArrowUp",
            "ArrowUp",
            "ArrowDown",
            "ArrowDown",
            "ArrowLeft",
            "ArrowRight",
            "ArrowLeft",
            "ArrowRight",
        ],
    });

    // ESC 키로 게임 닫기
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape" && showGame) {
                setShowGame(false);
            }
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [showGame]);

    if (!showGame) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center overflow-auto py-4">
            <div className="bg-white p-6 rounded-lg shadow-2xl max-h-[95vh] overflow-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">
                        🎮 Game Arcade
                    </h2>
                    <button
                        onClick={() => setShowGame(false)}
                        className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 transition-colors"
                    >
                        닫기 (ESC)
                    </button>
                </div>

                <Tabs defaultValue="snake" className="w-full">
                    <TabsList className="mb-4">
                        <TabsTrigger value="snake" className="px-4">
                            🐍 Snake
                        </TabsTrigger>
                        <TabsTrigger value="tictactoe" className="px-4">
                            ⭕ TicTacToe
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="snake">
                        <SnakeGame />
                        <p className="text-sm text-gray-500 mt-4 text-center">
                            방향키로 조작 | 스페이스바: 일시정지
                        </p>
                    </TabsContent>

                    <TabsContent value="tictactoe">
                        <TicTacToeGame />
                        <p className="text-sm text-gray-500 mt-4 text-center">
                            친구와 방 코드를 공유해서 대전하세요!
                        </p>
                    </TabsContent>
                </Tabs>

                <p className="text-xs text-gray-400 mt-4 text-center">
                    비밀 코드: ↑↑↓↓←→←→
                </p>
            </div>
        </div>
    );
}
