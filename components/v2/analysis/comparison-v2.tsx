"use client";

import { motion } from "framer-motion";
import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    Tooltip,
    ResponsiveContainer,
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    ZAxis,
} from "recharts";
import { StageStats } from "@/types/game-data";
import { formatStageId } from "@/lib/data-processor";
import { GlassCard } from "../cards/glass-card";
import { BarChart3, Target, Layers } from "lucide-react";

interface ComparisonV2Props {
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

export function ComparisonV2({ stageStats }: ComparisonV2Props) {
    // Top 6 stages for radar comparison
    const topStages = stageStats.slice(0, 6);
    const radarData = [
        {
            metric: "클리어율",
            ...Object.fromEntries(
                topStages.map((s) => [formatStageId(s.stageId), s.clearRate]),
            ),
        },
        {
            metric: "실패율",
            ...Object.fromEntries(
                topStages.map((s) => [
                    formatStageId(s.stageId),
                    100 - s.clearRate,
                ]),
            ),
        },
        {
            metric: "평균실패Lv",
            ...Object.fromEntries(
                topStages.map((s) => [
                    formatStageId(s.stageId),
                    (s.averageFailLevel / 20) * 100,
                ]),
            ),
        },
        {
            metric: "포기율",
            ...Object.fromEntries(
                topStages.map((s) => [
                    formatStageId(s.stageId),
                    s.totalAttempts > 0
                        ? (s.voluntaryExits / s.totalAttempts) * 100
                        : 0,
                ]),
            ),
        },
    ];

    // Scatter data for clear rate vs attempts
    const scatterData = stageStats.map((s) => ({
        x: s.totalAttempts,
        y: s.clearRate,
        z: s.fails,
        name: formatStageId(s.stageId),
    }));

    const COLORS = ["#8b5cf6", "#22d3ee", "#f472b6", "#fb923c", "#10b981", "#f59e0b"];

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
                                <BarChart3 className="w-5 h-5 text-violet-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">비교 스테이지</p>
                                <p className="text-2xl font-bold text-white">
                                    {stageStats.length}개
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
                                <p className="text-sm text-slate-400">클리어율 범위</p>
                                <p className="text-2xl font-bold text-white">
                                    {Math.min(...stageStats.map((s) => s.clearRate)).toFixed(0)}% -{" "}
                                    {Math.max(...stageStats.map((s) => s.clearRate)).toFixed(0)}%
                                </p>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <GlassCard gradient="pink" className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-pink-500/20">
                                <Layers className="w-5 h-5 text-pink-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">총 시도</p>
                                <p className="text-2xl font-bold text-white">
                                    {stageStats
                                        .reduce((sum, s) => sum + s.totalAttempts, 0)
                                        .toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Radar Chart */}
                <motion.div variants={itemVariants}>
                    <GlassCard gradient="none" hover={false} className="p-6">
                        <h3 className="text-lg font-semibold text-white mb-1">
                            스테이지 특성 비교
                        </h3>
                        <p className="text-sm text-slate-400 mb-4">
                            상위 6개 스테이지의 특성 비교
                        </p>
                        <div className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart data={radarData}>
                                    <PolarGrid stroke="#334155" />
                                    <PolarAngleAxis
                                        dataKey="metric"
                                        tick={{ fill: "#94a3b8", fontSize: 12 }}
                                    />
                                    <PolarRadiusAxis
                                        angle={30}
                                        domain={[0, 100]}
                                        tick={{ fill: "#64748b", fontSize: 10 }}
                                    />
                                    {topStages.map((stage, index) => (
                                        <Radar
                                            key={stage.stageId}
                                            name={formatStageId(stage.stageId)}
                                            dataKey={formatStageId(stage.stageId)}
                                            stroke={COLORS[index]}
                                            fill={COLORS[index]}
                                            fillOpacity={0.2}
                                            strokeWidth={2}
                                        />
                                    ))}
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "rgba(15, 23, 42, 0.95)",
                                            border: "1px solid rgba(255,255,255,0.1)",
                                            borderRadius: "12px",
                                        }}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </GlassCard>
                </motion.div>

                {/* Scatter Chart */}
                <motion.div variants={itemVariants}>
                    <GlassCard gradient="none" hover={false} className="p-6">
                        <h3 className="text-lg font-semibold text-white mb-1">
                            시도 횟수 vs 클리어율
                        </h3>
                        <p className="text-sm text-slate-400 mb-4">
                            점 크기 = 실패 횟수
                        </p>
                        <div className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart>
                                    <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                                    <XAxis
                                        type="number"
                                        dataKey="x"
                                        name="시도"
                                        stroke="#64748b"
                                        tick={{ fill: "#94a3b8", fontSize: 12 }}
                                    />
                                    <YAxis
                                        type="number"
                                        dataKey="y"
                                        name="클리어율"
                                        stroke="#64748b"
                                        tick={{ fill: "#94a3b8", fontSize: 12 }}
                                        tickFormatter={(v) => `${v}%`}
                                    />
                                    <ZAxis
                                        type="number"
                                        dataKey="z"
                                        range={[50, 400]}
                                        name="실패"
                                    />
                                    <Tooltip
                                        cursor={{ strokeDasharray: "3 3" }}
                                        contentStyle={{
                                            backgroundColor: "rgba(15, 23, 42, 0.95)",
                                            border: "1px solid rgba(255,255,255,0.1)",
                                            borderRadius: "12px",
                                        }}
                                        formatter={(value: number, name: string) => {
                                            if (name === "클리어율") return [`${value.toFixed(1)}%`, name];
                                            return [value.toLocaleString(), name];
                                        }}
                                    />
                                    <Scatter
                                        name="스테이지"
                                        data={scatterData}
                                        fill="#8b5cf6"
                                        fillOpacity={0.6}
                                    />
                                </ScatterChart>
                            </ResponsiveContainer>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>

            {/* Legend */}
            <motion.div variants={itemVariants}>
                <GlassCard gradient="none" hover={false} className="p-4">
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        {topStages.map((stage, index) => (
                            <div key={stage.stageId} className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: COLORS[index] }}
                                />
                                <span className="text-sm text-slate-300">
                                    {formatStageId(stage.stageId)}
                                </span>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </motion.div>
        </motion.div>
    );
}
