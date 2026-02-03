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
} from "recharts";
import { UserAttritionData } from "@/types/game-data";
import { formatStageId } from "@/lib/data-processor";
import { GlassCard } from "../cards/glass-card";
import { Users, UserMinus, TrendingDown } from "lucide-react";

interface UserAttritionV2Props {
    data: UserAttritionData[];
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

export function UserAttritionV2({ data }: UserAttritionV2Props) {
    const totalUsers = data[0]?.uniqueUsers || 0;
    const remainingUsers = data[data.length - 1]?.uniqueUsers || 0;
    const retentionRate = totalUsers > 0 ? (remainingUsers / totalUsers) * 100 : 0;

    const chartData = data.map((d) => ({
        ...d,
        stageName: formatStageId(d.stageId),
        retentionRate: totalUsers > 0 ? (d.uniqueUsers / totalUsers) * 100 : 0,
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
                                <p className="text-sm text-slate-400">시작 사용자</p>
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
                                <UserMinus className="w-5 h-5 text-violet-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">잔존 사용자</p>
                                <p className="text-2xl font-bold text-white">
                                    {remainingUsers.toLocaleString()}
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
                                <p className="text-sm text-slate-400">최종 잔존율</p>
                                <p className="text-2xl font-bold text-white">
                                    {retentionRate.toFixed(1)}%
                                </p>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>

            {/* User Retention Chart */}
            <motion.div variants={itemVariants}>
                <GlassCard gradient="none" hover={false} className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-1">
                        사용자 잔존 곡선
                    </h3>
                    <p className="text-sm text-slate-400 mb-4">
                        스테이지 진행에 따른 고유 사용자 수 변화
                    </p>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.5} />
                                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis
                                    dataKey="stageName"
                                    stroke="#64748b"
                                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                                />
                                <YAxis
                                    stroke="#64748b"
                                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                                    tickFormatter={(v) => `${v}%`}
                                    domain={[0, 100]}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "rgba(15, 23, 42, 0.95)",
                                        border: "1px solid rgba(255,255,255,0.1)",
                                        borderRadius: "12px",
                                    }}
                                    formatter={(value: number, name: string) => [
                                        name === "retentionRate"
                                            ? `${value.toFixed(1)}%`
                                            : value.toLocaleString(),
                                        name === "retentionRate" ? "잔존율" : "고유 사용자",
                                    ]}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="retentionRate"
                                    name="잔존율"
                                    stroke="#8b5cf6"
                                    strokeWidth={3}
                                    fill="url(#userGradient)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>
            </motion.div>

            {/* Stage Details */}
            <motion.div variants={itemVariants}>
                <GlassCard gradient="none" hover={false} className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                        스테이지별 상세 데이터
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium">
                                        스테이지
                                    </th>
                                    <th className="text-right py-3 px-4 text-slate-400 font-medium">
                                        고유 사용자
                                    </th>
                                    <th className="text-right py-3 px-4 text-slate-400 font-medium">
                                        잔존율
                                    </th>
                                    <th className="text-right py-3 px-4 text-slate-400 font-medium">
                                        이탈 수
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {chartData.map((item, index) => (
                                    <motion.tr
                                        key={item.stageName}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                    >
                                        <td className="py-3 px-4 text-white font-medium">
                                            {item.stageName}
                                        </td>
                                        <td className="text-right py-3 px-4 text-slate-300">
                                            {item.uniqueUsers.toLocaleString()}
                                        </td>
                                        <td className="text-right py-3 px-4">
                                            <span
                                                className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                    item.retentionRate >= 70
                                                        ? "bg-emerald-500/20 text-emerald-400"
                                                        : item.retentionRate >= 40
                                                          ? "bg-amber-500/20 text-amber-400"
                                                          : "bg-pink-500/20 text-pink-400"
                                                }`}
                                            >
                                                {item.retentionRate.toFixed(1)}%
                                            </span>
                                        </td>
                                        <td className="text-right py-3 px-4 text-pink-400">
                                            {index > 0
                                                ? (
                                                      chartData[index - 1].uniqueUsers -
                                                      item.uniqueUsers
                                                  ).toLocaleString()
                                                : "-"}
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
