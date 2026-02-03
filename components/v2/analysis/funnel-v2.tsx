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
import { GameEvent } from "@/types/game-data";
import { calculateFunnelData } from "@/lib/data-processor";
import { GlassCard } from "../cards/glass-card";
import { Users, TrendingDown, Target } from "lucide-react";

interface FunnelV2Props {
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

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-xl">
                <p className="text-white font-semibold mb-2">{data.name}</p>
                <p className="text-sm text-slate-300">
                    도달: <span className="text-cyan-400">{data.count.toLocaleString()}명</span>
                </p>
                <p className="text-sm text-slate-300">
                    비율: <span className="text-violet-400">{data.percentage.toFixed(1)}%</span>
                </p>
                {data.dropOff > 0 && (
                    <p className="text-sm text-slate-300">
                        이탈: <span className="text-pink-400">-{data.dropOff.toFixed(1)}%</span>
                    </p>
                )}
            </div>
        );
    }
    return null;
};

export function FunnelV2({ events }: FunnelV2Props) {
    const funnelData = calculateFunnelData(events);

    const chartData = funnelData.map((item, index, arr) => ({
        name: item.level === 0 ? "시작" : `Level ${item.level}`,
        count: item.remaining,
        percentage: 100 - item.dropRate,
        dropOff: index > 0 ? item.dropRate : 0,
    }));

    const totalStart = chartData[0]?.count || 0;
    const totalEnd = chartData[chartData.length - 1]?.count || 0;
    const overallRetention = totalStart > 0 ? (totalEnd / totalStart) * 100 : 0;
    const biggestDropIndex = chartData.reduce(
        (maxIdx, item, idx, arr) =>
            idx > 0 && item.dropOff > (arr[maxIdx]?.dropOff || 0) ? idx : maxIdx,
        1,
    );

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
                                <p className="text-sm text-slate-400">시작 플레이어</p>
                                <p className="text-2xl font-bold text-white">
                                    {totalStart.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <GlassCard gradient="purple" className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-violet-500/20">
                                <Target className="w-5 h-5 text-violet-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">최종 잔존율</p>
                                <p className="text-2xl font-bold text-white">
                                    {overallRetention.toFixed(1)}%
                                </p>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <GlassCard gradient="pink" className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-pink-500/20">
                                <TrendingDown className="w-5 h-5 text-pink-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">최대 이탈 구간</p>
                                <p className="text-2xl font-bold text-white">
                                    {chartData[biggestDropIndex]?.name}
                                    <span className="text-sm text-pink-400 ml-2">
                                        (-{chartData[biggestDropIndex]?.dropOff.toFixed(1)}%)
                                    </span>
                                </p>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>

            {/* Funnel Chart */}
            <motion.div variants={itemVariants}>
                <GlassCard gradient="none" hover={false} className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-1">
                        플레이어 잔존 퍼널
                    </h3>
                    <p className="text-sm text-slate-400 mb-4">
                        각 레벨까지 도달한 플레이어 수
                    </p>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="vertical">
                                <defs>
                                    <linearGradient id="funnelGradient" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#8b5cf6" />
                                        <stop offset="100%" stopColor="#22d3ee" />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#334155"
                                    horizontal={false}
                                />
                                <XAxis
                                    type="number"
                                    stroke="#64748b"
                                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                                    tickFormatter={(v) => `${v}%`}
                                    domain={[0, 100]}
                                />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    stroke="#64748b"
                                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                                    width={80}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="percentage" name="잔존율" radius={[0, 4, 4, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={`rgba(139, 92, 246, ${0.3 + (entry.percentage / 100) * 0.7})`}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>
            </motion.div>

            {/* Drop-off Analysis */}
            <motion.div variants={itemVariants}>
                <GlassCard gradient="none" hover={false} className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                        구간별 이탈률
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {chartData.slice(1).map((item, index) => (
                            <motion.div
                                key={item.name}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className={`p-3 rounded-xl border ${
                                    item.dropOff > 10
                                        ? "bg-pink-500/10 border-pink-500/30"
                                        : item.dropOff > 5
                                          ? "bg-amber-500/10 border-amber-500/30"
                                          : "bg-slate-800/50 border-white/10"
                                }`}
                            >
                                <p className="text-sm text-slate-400">{item.name}</p>
                                <p
                                    className={`text-lg font-bold ${
                                        item.dropOff > 10
                                            ? "text-pink-400"
                                            : item.dropOff > 5
                                              ? "text-amber-400"
                                              : "text-slate-300"
                                    }`}
                                >
                                    -{item.dropOff.toFixed(1)}%
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </GlassCard>
            </motion.div>
        </motion.div>
    );
}
