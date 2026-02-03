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
    Cell,
} from "recharts";
import { UserStageStats, StageReviveStats, GameEvent, ReviveEvent } from "@/types/game-data";
import { formatStageId } from "@/lib/data-processor";
import { GlassCard } from "../cards/glass-card";
import { Users, Target, Repeat } from "lucide-react";

interface UserStageV2Props {
    data: UserStageStats[];
    reviveStats: StageReviveStats[];
    events: GameEvent[];
    reviveEvents: ReviveEvent[];
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

export function UserStageV2({ data }: UserStageV2Props) {
    const totalUsers = data.reduce((sum, d) => sum + d.uniqueUsers, 0);
    const avgAttemptsPerUser =
        data.length > 0
            ? data.reduce((sum, d) => sum + d.averageAttemptsPerUser, 0) / data.length
            : 0;

    const chartData = data.map((d) => ({
        stage: formatStageId(d.stageId),
        users: d.uniqueUsers,
        avgAttempts: parseFloat(d.averageAttemptsPerUser.toFixed(2)),
        clearRate: d.userClearRate,
    }));

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
                    <GlassCard gradient="cyan" className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-cyan-500/20">
                                <Users className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">총 플레이어</p>
                                <p className="text-2xl font-bold text-white">
                                    {totalUsers.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <GlassCard gradient="purple" className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-violet-500/20">
                                <Repeat className="w-5 h-5 text-violet-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">평균 시도 횟수</p>
                                <p className="text-2xl font-bold text-white">
                                    {avgAttemptsPerUser.toFixed(2)}회
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
                                    {data.length}개
                                </p>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>

            {/* User Distribution Chart */}
            <motion.div variants={itemVariants}>
                <GlassCard gradient="none" hover={false} className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-1">
                        스테이지별 사용자 분포
                    </h3>
                    <p className="text-sm text-slate-400 mb-4">
                        각 스테이지를 플레이한 고유 사용자 수
                    </p>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <defs>
                                    <linearGradient id="userBarGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#22d3ee" />
                                        <stop offset="100%" stopColor="#8b5cf6" />
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
                                    dataKey="users"
                                    name="고유 사용자"
                                    fill="url(#userBarGradient)"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>
            </motion.div>

            {/* Average Attempts Chart */}
            <motion.div variants={itemVariants}>
                <GlassCard gradient="none" hover={false} className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-1">
                        평균 시도 횟수
                    </h3>
                    <p className="text-sm text-slate-400 mb-4">
                        사용자당 평균 시도 횟수 (높을수록 재시도가 많음)
                    </p>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
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
                                <Bar dataKey="avgAttempts" name="평균 시도" radius={[4, 4, 0, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={
                                                entry.avgAttempts > 3
                                                    ? "#f472b6"
                                                    : entry.avgAttempts > 2
                                                      ? "#fb923c"
                                                      : "#8b5cf6"
                                            }
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>
            </motion.div>
        </motion.div>
    );
}
