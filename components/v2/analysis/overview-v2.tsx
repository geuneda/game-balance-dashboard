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
    AreaChart,
    Area,
} from "recharts";
import { StageStats } from "@/types/game-data";
import { formatStageId } from "@/lib/data-processor";
import { GlassCard } from "../cards/glass-card";
import { TrendingUp, Target, AlertTriangle } from "lucide-react";

interface OverviewV2Props {
    stageStats: StageStats[];
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
                <p className="text-white font-semibold mb-2">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} className="text-sm" style={{ color: entry.color }}>
                        {entry.name}: {entry.value}
                        {entry.name.includes("율") || entry.name.includes("%") ? "%" : ""}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export function OverviewV2({ stageStats }: OverviewV2Props) {
    const chartData = stageStats.map((stat) => ({
        stage: formatStageId(stat.stageId),
        clearRate: parseFloat(stat.clearRate.toFixed(1)),
        attempts: stat.totalAttempts,
        clears: stat.clears,
        fails: stat.fails,
        avgFailLevel: parseFloat(stat.averageFailLevel.toFixed(1)),
        voluntaryExits: stat.voluntaryExits,
    }));

    const getGradientId = (rate: number) => {
        if (rate >= 70) return "url(#gradientGreen)";
        if (rate >= 50) return "url(#gradientBlue)";
        if (rate >= 30) return "url(#gradientOrange)";
        return "url(#gradientRed)";
    };

    const avgClearRate =
        stageStats.reduce((sum, s) => sum + s.clearRate, 0) / stageStats.length;
    const lowestClearRate = Math.min(...stageStats.map((s) => s.clearRate));
    const lowestStage = stageStats.find((s) => s.clearRate === lowestClearRate);

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div variants={itemVariants}>
                    <GlassCard gradient="purple" className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-violet-500/20">
                                <TrendingUp className="w-5 h-5 text-violet-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">평균 클리어율</p>
                                <p className="text-2xl font-bold text-white">
                                    {avgClearRate.toFixed(1)}%
                                </p>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <GlassCard gradient="cyan" className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-cyan-500/20">
                                <Target className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">분석 스테이지</p>
                                <p className="text-2xl font-bold text-white">
                                    {stageStats.length}개
                                </p>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <GlassCard gradient="pink" className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-pink-500/20">
                                <AlertTriangle className="w-5 h-5 text-pink-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">최저 클리어율</p>
                                <p className="text-2xl font-bold text-white">
                                    {lowestClearRate.toFixed(1)}%
                                    <span className="text-sm text-slate-400 ml-2">
                                        ({lowestStage && formatStageId(lowestStage.stageId)})
                                    </span>
                                </p>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Clear Rate Chart */}
                <motion.div variants={itemVariants}>
                    <GlassCard gradient="none" hover={false} className="p-6">
                        <h3 className="text-lg font-semibold text-white mb-1">
                            스테이지별 클리어율
                        </h3>
                        <p className="text-sm text-slate-400 mb-4">
                            색상으로 난이도 구분 (초록: 쉬움, 빨강: 어려움)
                        </p>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <defs>
                                        <linearGradient
                                            id="gradientGreen"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop offset="0%" stopColor="#10b981" />
                                            <stop offset="100%" stopColor="#059669" />
                                        </linearGradient>
                                        <linearGradient
                                            id="gradientBlue"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop offset="0%" stopColor="#3b82f6" />
                                            <stop offset="100%" stopColor="#2563eb" />
                                        </linearGradient>
                                        <linearGradient
                                            id="gradientOrange"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop offset="0%" stopColor="#f59e0b" />
                                            <stop offset="100%" stopColor="#d97706" />
                                        </linearGradient>
                                        <linearGradient
                                            id="gradientRed"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop offset="0%" stopColor="#ef4444" />
                                            <stop offset="100%" stopColor="#dc2626" />
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
                                        axisLine={{ stroke: "#334155" }}
                                    />
                                    <YAxis
                                        stroke="#64748b"
                                        tick={{ fill: "#94a3b8", fontSize: 12 }}
                                        axisLine={{ stroke: "#334155" }}
                                        tickFormatter={(v) => `${v}%`}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar
                                        dataKey="clearRate"
                                        name="클리어율"
                                        radius={[4, 4, 0, 0]}
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={getGradientId(entry.clearRate)}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </GlassCard>
                </motion.div>

                {/* Average Fail Level Chart */}
                <motion.div variants={itemVariants}>
                    <GlassCard gradient="none" hover={false} className="p-6">
                        <h3 className="text-lg font-semibold text-white mb-1">
                            평균 실패 레벨 추이
                        </h3>
                        <p className="text-sm text-slate-400 mb-4">
                            플레이어들이 실패하는 평균 웨이브
                        </p>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient
                                            id="gradientPurple"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="0%"
                                                stopColor="#8b5cf6"
                                                stopOpacity={0.4}
                                            />
                                            <stop
                                                offset="100%"
                                                stopColor="#8b5cf6"
                                                stopOpacity={0}
                                            />
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
                                        axisLine={{ stroke: "#334155" }}
                                    />
                                    <YAxis
                                        stroke="#64748b"
                                        tick={{ fill: "#94a3b8", fontSize: 12 }}
                                        axisLine={{ stroke: "#334155" }}
                                        domain={[0, 20]}
                                        tickFormatter={(v) => `Lv.${v}`}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="avgFailLevel"
                                        name="평균 실패 레벨"
                                        stroke="#8b5cf6"
                                        strokeWidth={2}
                                        fill="url(#gradientPurple)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>

            {/* Stats Table */}
            <motion.div variants={itemVariants}>
                <GlassCard gradient="none" hover={false} className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                        스테이지 상세 통계
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium">
                                        스테이지
                                    </th>
                                    <th className="text-right py-3 px-4 text-slate-400 font-medium">
                                        시도
                                    </th>
                                    <th className="text-right py-3 px-4 text-slate-400 font-medium">
                                        클리어
                                    </th>
                                    <th className="text-right py-3 px-4 text-slate-400 font-medium">
                                        실패
                                    </th>
                                    <th className="text-right py-3 px-4 text-slate-400 font-medium">
                                        자발적 포기
                                    </th>
                                    <th className="text-right py-3 px-4 text-slate-400 font-medium">
                                        클리어율
                                    </th>
                                    <th className="text-right py-3 px-4 text-slate-400 font-medium">
                                        평균 실패 Lv
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {stageStats.map((stat, index) => (
                                    <motion.tr
                                        key={stat.stageId}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                    >
                                        <td className="py-3 px-4 text-white font-medium">
                                            {formatStageId(stat.stageId)}
                                        </td>
                                        <td className="text-right py-3 px-4 text-slate-300">
                                            {stat.totalAttempts.toLocaleString()}
                                        </td>
                                        <td className="text-right py-3 px-4 text-emerald-400">
                                            {stat.clears.toLocaleString()}
                                        </td>
                                        <td className="text-right py-3 px-4 text-red-400">
                                            {stat.fails.toLocaleString()}
                                        </td>
                                        <td className="text-right py-3 px-4 text-amber-400">
                                            {stat.voluntaryExits.toLocaleString()}
                                        </td>
                                        <td className="text-right py-3 px-4">
                                            <span
                                                className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                    stat.clearRate >= 70
                                                        ? "bg-emerald-500/20 text-emerald-400"
                                                        : stat.clearRate >= 50
                                                          ? "bg-blue-500/20 text-blue-400"
                                                          : stat.clearRate >= 30
                                                            ? "bg-amber-500/20 text-amber-400"
                                                            : "bg-red-500/20 text-red-400"
                                                }`}
                                            >
                                                {stat.clearRate.toFixed(1)}%
                                            </span>
                                        </td>
                                        <td className="text-right py-3 px-4 text-slate-300">
                                            {stat.averageFailLevel.toFixed(1)}
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
