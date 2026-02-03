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
} from "recharts";
import { StageReviveStats } from "@/types/game-data";
import { formatStageId } from "@/lib/data-processor";
import { GlassCard } from "../cards/glass-card";
import { Heart, Zap, TrendingUp } from "lucide-react";

interface ReviveV2Props {
    data: StageReviveStats[];
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

export function ReviveV2({ data }: ReviveV2Props) {
    const totalRevives = data.reduce((sum, d) => sum + d.totalReviveEvents, 0);
    const avgReviveRate =
        data.length > 0
            ? data.reduce((sum, d) => sum + (d.totalGamesWithRevive / Math.max(1, d.totalReviveEvents)) * 100, 0) / data.length
            : 0;
    const mostRevived = data.reduce(
        (max, d) => (d.totalReviveEvents > max.totalReviveEvents ? d : max),
        data[0] || { stageId: "-", totalReviveEvents: 0 },
    );

    const chartData = data.map((d) => ({
        stage: formatStageId(d.stageId),
        revives: d.totalReviveEvents,
        reviveRate: d.totalGamesWithRevive > 0 ? (d.totalGamesWithRevive / d.totalReviveEvents) * 100 : 0,
        avgPerUser: d.averageRevivePerGame,
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
                                <Heart className="w-5 h-5 text-pink-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">총 부활 횟수</p>
                                <p className="text-2xl font-bold text-white">
                                    {totalRevives.toLocaleString()}
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
                                <p className="text-sm text-slate-400">평균 부활률</p>
                                <p className="text-2xl font-bold text-white">
                                    {avgReviveRate.toFixed(1)}%
                                </p>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <GlassCard gradient="purple" className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-violet-500/20">
                                <Zap className="w-5 h-5 text-violet-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">최다 부활 스테이지</p>
                                <p className="text-2xl font-bold text-white">
                                    {formatStageId(mostRevived.stageId)}
                                </p>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>

            {/* Revive Chart */}
            <motion.div variants={itemVariants}>
                <GlassCard gradient="none" hover={false} className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-1">
                        스테이지별 부활 현황
                    </h3>
                    <p className="text-sm text-slate-400 mb-4">
                        각 스테이지에서 사용된 부활 횟수
                    </p>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <defs>
                                    <linearGradient id="reviveGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#f472b6" />
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
                                    dataKey="revives"
                                    name="부활 횟수"
                                    fill="url(#reviveGradient)"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>
            </motion.div>

            {/* Revive Details Table */}
            <motion.div variants={itemVariants}>
                <GlassCard gradient="none" hover={false} className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                        부활 상세 통계
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium">
                                        스테이지
                                    </th>
                                    <th className="text-right py-3 px-4 text-slate-400 font-medium">
                                        부활 횟수
                                    </th>
                                    <th className="text-right py-3 px-4 text-slate-400 font-medium">
                                        부활률
                                    </th>
                                    <th className="text-right py-3 px-4 text-slate-400 font-medium">
                                        사용자당 평균
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((item, index) => (
                                    <motion.tr
                                        key={item.stageId}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                    >
                                        <td className="py-3 px-4 text-white font-medium">
                                            {formatStageId(item.stageId)}
                                        </td>
                                        <td className="text-right py-3 px-4 text-pink-400">
                                            {item.totalReviveEvents.toLocaleString()}
                                        </td>
                                        <td className="text-right py-3 px-4 text-slate-300">
                                            {item.totalGamesWithRevive > 0 ? ((item.totalGamesWithRevive / item.totalReviveEvents) * 100).toFixed(1) : "0.0"}%
                                        </td>
                                        <td className="text-right py-3 px-4 text-slate-300">
                                            {item.averageRevivePerGame.toFixed(2)}
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
