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
    PieChart,
    Pie,
} from "recharts";
import { StageAttritionData } from "@/types/game-data";
import { formatStageId } from "@/lib/data-processor";
import { GlassCard } from "../cards/glass-card";
import { UserMinus, TrendingDown, AlertCircle } from "lucide-react";

interface AttritionV2Props {
    data: StageAttritionData[];
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

const COLORS = ["#8b5cf6", "#22d3ee", "#f472b6", "#fb923c", "#10b981"];

export function AttritionV2({ data }: AttritionV2Props) {
    const totalAttrition = data.reduce((sum, d) => sum + d.attritionCount, 0);
    const avgAttritionRate =
        data.reduce((sum, d) => sum + d.attritionRate, 0) / data.length;
    const highestAttrition = data.reduce(
        (max, d) => (d.attritionRate > max.attritionRate ? d : max),
        data[0],
    );

    const pieData = data
        .sort((a, b) => b.attritionCount - a.attritionCount)
        .slice(0, 5)
        .map((d) => ({
            name: formatStageId(d.stageId),
            value: d.attritionCount,
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
                    <GlassCard gradient="pink" className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-pink-500/20">
                                <UserMinus className="w-5 h-5 text-pink-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">총 이탈</p>
                                <p className="text-2xl font-bold text-white">
                                    {totalAttrition.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <GlassCard gradient="cyan" className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-cyan-500/20">
                                <TrendingDown className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">평균 이탈률</p>
                                <p className="text-2xl font-bold text-white">
                                    {avgAttritionRate.toFixed(1)}%
                                </p>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <GlassCard gradient="orange" className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-orange-500/20">
                                <AlertCircle className="w-5 h-5 text-orange-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">최고 이탈 스테이지</p>
                                <p className="text-2xl font-bold text-white">
                                    {highestAttrition ? formatStageId(highestAttrition.stageId) : "-"}
                                </p>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div variants={itemVariants}>
                    <GlassCard gradient="none" hover={false} className="p-6">
                        <h3 className="text-lg font-semibold text-white mb-1">
                            스테이지별 이탈률
                        </h3>
                        <p className="text-sm text-slate-400 mb-4">
                            각 스테이지에서의 플레이어 이탈 비율
                        </p>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#334155"
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="stageId"
                                        stroke="#64748b"
                                        tick={{ fill: "#94a3b8", fontSize: 12 }}
                                        tickFormatter={(v) => formatStageId(v)}
                                    />
                                    <YAxis
                                        stroke="#64748b"
                                        tick={{ fill: "#94a3b8", fontSize: 12 }}
                                        tickFormatter={(v) => `${v}%`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "rgba(15, 23, 42, 0.95)",
                                            border: "1px solid rgba(255,255,255,0.1)",
                                            borderRadius: "12px",
                                        }}
                                    />
                                    <Bar
                                        dataKey="attritionRate"
                                        name="이탈률"
                                        radius={[4, 4, 0, 0]}
                                    >
                                        {data.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={
                                                    entry.attritionRate > 20
                                                        ? "#f472b6"
                                                        : entry.attritionRate > 10
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

                <motion.div variants={itemVariants}>
                    <GlassCard gradient="none" hover={false} className="p-6">
                        <h3 className="text-lg font-semibold text-white mb-1">
                            이탈 분포 (상위 5개)
                        </h3>
                        <p className="text-sm text-slate-400 mb-4">
                            가장 많은 이탈이 발생한 스테이지
                        </p>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={3}
                                        dataKey="value"
                                        label={({ name, percent }) =>
                                            `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
                                        }
                                        labelLine={{ stroke: "#64748b" }}
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={COLORS[index % COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "rgba(15, 23, 42, 0.95)",
                                            border: "1px solid rgba(255,255,255,0.1)",
                                            borderRadius: "12px",
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>
        </motion.div>
    );
}
