"use client";

import { motion } from "framer-motion";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ComposedChart,
    Bar,
    Line,
} from "recharts";
import { DifficultySpike } from "@/types/game-data";
import { GlassCard } from "../cards/glass-card";
import { AlertTriangle, TrendingUp, Zap } from "lucide-react";

interface DifficultyV2Props {
    difficultySpikes: DifficultySpike[];
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

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-xl">
                <p className="text-white font-semibold mb-2">Level {label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} className="text-sm text-slate-300">
                        {entry.name}: <span style={{ color: entry.color }}>{entry.value}{entry.name.includes("율") ? "%" : ""}</span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export function DifficultyV2({ difficultySpikes }: DifficultyV2Props) {
    const chartData = difficultySpikes.map((spike) => ({
        level: spike.level,
        failCount: spike.failCount,
        failRate: parseFloat(spike.failRate.toFixed(1)),
    }));

    // Find significant difficulty spikes
    const significantSpikes = difficultySpikes
        .map((spike, index) => {
            if (index === 0) return null;
            const prevSpike = difficultySpikes[index - 1];
            const increase = spike.failRate - prevSpike.failRate;
            if (spike.failRate > 20 && increase > 10) {
                return {
                    level: spike.level,
                    failRate: spike.failRate,
                    increase: increase,
                };
            }
            return null;
        })
        .filter((spike): spike is NonNullable<typeof spike> => spike !== null);

    const avgFailRate =
        chartData.reduce((sum, d) => sum + d.failRate, 0) / chartData.length;
    const maxFailRate = Math.max(...chartData.map((d) => d.failRate));
    const maxFailLevel = chartData.find((d) => d.failRate === maxFailRate);

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
                    <GlassCard gradient="pink" className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-pink-500/20">
                                <Zap className="w-5 h-5 text-pink-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">난이도 스파이크</p>
                                <p className="text-2xl font-bold text-white">
                                    {significantSpikes.length}개
                                </p>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <GlassCard gradient="cyan" className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-cyan-500/20">
                                <TrendingUp className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">평균 실패율</p>
                                <p className="text-2xl font-bold text-white">
                                    {avgFailRate.toFixed(1)}%
                                </p>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <GlassCard gradient="purple" className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-violet-500/20">
                                <AlertTriangle className="w-5 h-5 text-violet-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">최고 실패율</p>
                                <p className="text-2xl font-bold text-white">
                                    Lv.{maxFailLevel?.level} ({maxFailRate.toFixed(1)}%)
                                </p>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>

            {/* Spike Alert */}
            {significantSpikes.length > 0 && (
                <motion.div variants={itemVariants}>
                    <GlassCard gradient="pink" glow hover={false} className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertTriangle className="w-5 h-5 text-pink-400" />
                            <h3 className="text-lg font-semibold text-white">
                                감지된 난이도 스파이크
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {significantSpikes.map((spike, index) => (
                                <motion.div
                                    key={spike.level}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-slate-800/50 rounded-xl p-4 border border-pink-500/20"
                                >
                                    <p className="text-2xl font-bold text-pink-400">
                                        Level {spike.level}
                                    </p>
                                    <div className="flex justify-between text-sm mt-2">
                                        <span className="text-slate-400">실패율</span>
                                        <span className="text-white font-medium">
                                            {spike.failRate.toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">증가폭</span>
                                        <span className="text-amber-400 font-medium">
                                            +{spike.increase.toFixed(1)}%
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </GlassCard>
                </motion.div>
            )}

            {/* Fail Rate Curve */}
            <motion.div variants={itemVariants}>
                <GlassCard gradient="none" hover={false} className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-1">
                        레벨별 실패율 곡선
                    </h3>
                    <p className="text-sm text-slate-400 mb-4">
                        각 레벨(웨이브)에서의 플레이어 실패율 추이
                    </p>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="failRateGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#f472b6" stopOpacity={0.5} />
                                        <stop offset="100%" stopColor="#f472b6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis
                                    dataKey="level"
                                    stroke="#64748b"
                                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                                    label={{ value: "Level", position: "insideBottom", offset: -5, fill: "#94a3b8" }}
                                />
                                <YAxis
                                    stroke="#64748b"
                                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                                    tickFormatter={(v) => `${v}%`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="failRate"
                                    name="실패율"
                                    stroke="#f472b6"
                                    strokeWidth={3}
                                    fill="url(#failRateGradient)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>
            </motion.div>

            {/* Fail Count Chart */}
            <motion.div variants={itemVariants}>
                <GlassCard gradient="none" hover={false} className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-1">
                        레벨별 실패 횟수
                    </h3>
                    <p className="text-sm text-slate-400 mb-4">
                        각 레벨에서 발생한 총 실패 횟수와 실패율
                    </p>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis
                                    dataKey="level"
                                    stroke="#64748b"
                                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                                />
                                <YAxis
                                    yAxisId="left"
                                    stroke="#64748b"
                                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    stroke="#64748b"
                                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                                    tickFormatter={(v) => `${v}%`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar
                                    yAxisId="left"
                                    dataKey="failCount"
                                    name="실패 횟수"
                                    fill="#8b5cf6"
                                    radius={[4, 4, 0, 0]}
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="failRate"
                                    name="실패율"
                                    stroke="#fb923c"
                                    strokeWidth={2}
                                    dot={{ fill: "#fb923c", r: 4 }}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>
            </motion.div>

            {/* Level Analysis Table */}
            <motion.div variants={itemVariants}>
                <GlassCard gradient="none" hover={false} className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                        레벨별 상세 분석 (위험도 순)
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium">
                                        레벨
                                    </th>
                                    <th className="text-right py-3 px-4 text-slate-400 font-medium">
                                        실패 횟수
                                    </th>
                                    <th className="text-right py-3 px-4 text-slate-400 font-medium">
                                        실패율
                                    </th>
                                    <th className="text-right py-3 px-4 text-slate-400 font-medium">
                                        위험도
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {chartData
                                    .sort((a, b) => b.failRate - a.failRate)
                                    .slice(0, 10)
                                    .map((data, index) => (
                                        <motion.tr
                                            key={data.level}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                        >
                                            <td className="py-3 px-4 text-white font-medium">
                                                Level {data.level}
                                            </td>
                                            <td className="text-right py-3 px-4 text-slate-300">
                                                {data.failCount.toLocaleString()}
                                            </td>
                                            <td className="text-right py-3 px-4">
                                                <span
                                                    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                        data.failRate >= 40
                                                            ? "bg-red-500/20 text-red-400"
                                                            : data.failRate >= 25
                                                              ? "bg-amber-500/20 text-amber-400"
                                                              : data.failRate >= 15
                                                                ? "bg-blue-500/20 text-blue-400"
                                                                : "bg-emerald-500/20 text-emerald-400"
                                                    }`}
                                                >
                                                    {data.failRate.toFixed(1)}%
                                                </span>
                                            </td>
                                            <td className="text-right py-3 px-4">
                                                {data.failRate >= 40 ? (
                                                    <span className="text-red-400 font-semibold">
                                                        매우 높음
                                                    </span>
                                                ) : data.failRate >= 25 ? (
                                                    <span className="text-amber-400 font-semibold">
                                                        높음
                                                    </span>
                                                ) : data.failRate >= 15 ? (
                                                    <span className="text-blue-400">보통</span>
                                                ) : (
                                                    <span className="text-emerald-400">낮음</span>
                                                )}
                                            </td>
                                        </motion.tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </GlassCard>
            </motion.div>
        </motion.div>
    );
}
