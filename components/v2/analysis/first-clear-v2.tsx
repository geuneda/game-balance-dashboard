"use client";

import { motion } from "framer-motion";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ScatterChart,
    Scatter,
    ZAxis,
} from "recharts";
import { GameEvent } from "@/types/game-data";
import { GlassCard } from "../cards/glass-card";
import { Trophy, Target, Clock } from "lucide-react";

interface FirstClearV2Props {
    events: GameEvent[];
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

export function FirstClearV2({ events }: FirstClearV2Props) {
    // Calculate first clear data
    const userFirstClears = new Map<string, Map<string, number>>();

    events
        .filter((e) => e.eventAction === "clear")
        .forEach((e) => {
            const userId = e.userId || "unknown";
            if (!userFirstClears.has(userId)) {
                userFirstClears.set(userId, new Map());
            }
            const userStages = userFirstClears.get(userId)!;
            if (!userStages.has(e.eventLabel)) {
                userStages.set(e.eventLabel, 1);
            }
        });

    // Get attempts before first clear for each user/stage
    const stageAttempts = new Map<string, number[]>();
    events.forEach((e) => {
        if (e.eventAction === "try") {
            const userId = e.userId || "unknown";
            const key = `${userId}-${e.eventLabel}`;
            const userClears = userFirstClears.get(userId);
            if (userClears && !userClears.has(e.eventLabel)) {
                if (!stageAttempts.has(e.eventLabel)) {
                    stageAttempts.set(e.eventLabel, []);
                }
                stageAttempts.get(e.eventLabel)!.push(1);
            }
        }
    });

    // Calculate average attempts for first clear per stage
    const chartData = Array.from(stageAttempts.entries())
        .map(([stageId, attempts]) => ({
            stage: stageId,
            avgAttempts: attempts.length > 0 ? attempts.length / new Set(attempts).size : 0,
            totalClears: userFirstClears.size,
        }))
        .sort((a, b) => parseInt(a.stage) - parseInt(b.stage))
        .slice(0, 20);

    const totalFirstClears = userFirstClears.size;
    const avgAttemptsOverall =
        chartData.length > 0
            ? chartData.reduce((sum, d) => sum + d.avgAttempts, 0) / chartData.length
            : 0;

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div variants={itemVariants}>
                    <GlassCard gradient="purple" className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-violet-500/20">
                                <Trophy className="w-5 h-5 text-violet-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">첫 클리어 사용자</p>
                                <p className="text-2xl font-bold text-white">
                                    {totalFirstClears.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <GlassCard gradient="cyan" className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-cyan-500/20">
                                <Clock className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">평균 시도 횟수</p>
                                <p className="text-2xl font-bold text-white">
                                    {avgAttemptsOverall.toFixed(1)}회
                                </p>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <GlassCard gradient="pink" className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-pink-500/20">
                                <Target className="w-5 h-5 text-pink-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">분석 스테이지</p>
                                <p className="text-2xl font-bold text-white">
                                    {chartData.length}개
                                </p>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>

            {/* First Clear Attempts Chart */}
            <motion.div variants={itemVariants}>
                <GlassCard gradient="none" hover={false} className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-1">
                        첫 클리어까지 평균 시도
                    </h3>
                    <p className="text-sm text-slate-400 mb-4">
                        각 스테이지를 처음 클리어하기까지의 평균 시도 횟수
                    </p>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <defs>
                                    <linearGradient
                                        id="firstClearGradient"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop offset="0%" stopColor="#a855f7" />
                                        <stop offset="100%" stopColor="#6366f1" />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#334155"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="stage"
                                    stroke="#64748b"
                                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                                />
                                <YAxis
                                    stroke="#64748b"
                                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "rgba(15, 23, 42, 0.95)",
                                        border: "1px solid rgba(255,255,255,0.1)",
                                        borderRadius: "12px",
                                    }}
                                />
                                <Bar
                                    dataKey="avgAttempts"
                                    name="평균 시도 횟수"
                                    fill="url(#firstClearGradient)"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>
            </motion.div>

            {/* Info Card */}
            <motion.div variants={itemVariants}>
                <GlassCard gradient="purple" glow hover={false} className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-2">
                        첫 클리어 분석 인사이트
                    </h3>
                    <div className="space-y-2 text-sm text-slate-300">
                        <p>
                            첫 클리어까지 시도 횟수가 높은 스테이지는 신규 플레이어에게
                            난이도가 높게 느껴질 수 있습니다.
                        </p>
                        <p>
                            3회 이상의 시도가 필요한 스테이지는 튜토리얼 보강이나
                            난이도 조정을 고려해보세요.
                        </p>
                    </div>
                </GlassCard>
            </motion.div>
        </motion.div>
    );
}
