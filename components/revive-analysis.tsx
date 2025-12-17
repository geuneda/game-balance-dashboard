"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { StageReviveStats } from "@/types/game-data";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import { formatStageId } from "@/lib/data-processor";

interface Props {
    data: StageReviveStats[];
}

const COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
    "#f97316",
];

export function ReviveAnalysis({ data }: Props) {
    // 차트 데이터에 포맷팅된 스테이지 이름 추가
    const chartData = data.map((stage) => ({
        ...stage,
        formattedStageId: formatStageId(stage.stageId),
    }));

    // Calculate overall metrics
    const totalReviveEvents = data.reduce(
        (sum, stage) => sum + stage.totalReviveEvents,
        0
    );
    const totalGamesWithRevive = data.reduce(
        (sum, stage) => sum + stage.totalGamesWithRevive,
        0
    );
    const avgRevivePerGame =
        totalGamesWithRevive > 0 ? totalReviveEvents / totalGamesWithRevive : 0;

    // Find stages with most/least revives
    const topReviveStages = [...chartData]
        .sort((a, b) => b.totalReviveEvents - a.totalReviveEvents)
        .slice(0, 5);

    const highestAvgReviveStages = [...chartData]
        .filter((d) => d.totalGamesWithRevive > 0)
        .sort((a, b) => b.averageRevivePerGame - a.averageRevivePerGame)
        .slice(0, 5);

    // Aggregate revive count distribution across all stages
    const overallReviveDistribution = new Map<number, number>();
    data.forEach((stage) => {
        stage.reviveCountDistribution.forEach((dist) => {
            overallReviveDistribution.set(
                dist.reviveCount,
                (overallReviveDistribution.get(dist.reviveCount) || 0) +
                    dist.gameCount
            );
        });
    });

    const reviveDistributionData = Array.from(
        overallReviveDistribution.entries()
    )
        .map(([reviveCount, gameCount]) => ({
            reviveCount: `${reviveCount}회`,
            gameCount,
            label: `${reviveCount}회 부활`,
        }))
        .sort((a, b) => parseInt(a.reviveCount) - parseInt(b.reviveCount));

    // Aggregate revive type distribution
    const overallReviveTypeDistribution = new Map<string, number>();
    data.forEach((stage) => {
        Object.entries(stage.reviveTypeDistribution).forEach(
            ([type, count]) => {
                overallReviveTypeDistribution.set(
                    type,
                    (overallReviveTypeDistribution.get(type) || 0) + count
                );
            }
        );
    });

    const reviveTypeData = Array.from(overallReviveTypeDistribution.entries())
        .map(([type, count]) => ({
            name: type,
            value: count,
        }))
        .sort((a, b) => b.value - a.value);

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-300">
                            총 부활 이벤트
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            {totalReviveEvents.toLocaleString()}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            전체 스테이지
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-300">
                            부활 사용 게임
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            {totalGamesWithRevive.toLocaleString()}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            부활을 사용한 게임 수
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-300">
                            게임당 평균 부활
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            {avgRevivePerGame.toFixed(2)}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            부활 사용 게임 기준
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-300">
                            분석 스테이지
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            {data.length}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            부활 데이터가 있는 스테이지
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Revive Count Distribution Chart */}
            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                <CardHeader>
                    <CardTitle className="text-white">부활 횟수 분포</CardTitle>
                    <CardDescription className="text-slate-400">
                        한 게임에서 사용한 총 부활 횟수별 게임 수
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={reviveDistributionData}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#334155"
                            />
                            <XAxis dataKey="reviveCount" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#1e293b",
                                    border: "1px solid #475569",
                                    borderRadius: "0.5rem",
                                    color: "#f1f5f9",
                                }}
                                formatter={(value: number, name: string) => {
                                    const labels: Record<string, string> = {
                                        gameCount: "게임 수",
                                    };
                                    return [
                                        value.toLocaleString(),
                                        labels[name] || name,
                                    ];
                                }}
                            />
                            <Legend
                                formatter={(value: string) => {
                                    const labels: Record<string, string> = {
                                        gameCount: "게임 수",
                                    };
                                    return labels[value] || value;
                                }}
                                wrapperStyle={{ color: "#94a3b8" }}
                            />
                            <Bar
                                dataKey="gameCount"
                                fill="#8b5cf6"
                                name="gameCount"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Two column layout for charts */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Revive Type Distribution */}
                {reviveTypeData.length > 0 && (
                    <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                        <CardHeader>
                            <CardTitle className="text-white">
                                부활 타입 분포
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                                부활 방법별 사용 횟수
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={reviveTypeData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) =>
                                            `${name} (${(
                                                (percent ?? 0) * 100
                                            ).toFixed(0)}%)`
                                        }
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {reviveTypeData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={
                                                    COLORS[
                                                        index % COLORS.length
                                                    ]
                                                }
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#1e293b",
                                            border: "1px solid #475569",
                                            borderRadius: "0.5rem",
                                            color: "#f1f5f9",
                                        }}
                                        formatter={(value: number) => [
                                            value.toLocaleString(),
                                            "사용 횟수",
                                        ]}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                )}

                {/* Stages with Most Revives */}
                <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                    <CardHeader>
                        <CardTitle className="text-white">
                            부활 상위 스테이지
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            부활이 가장 많이 발생하는 스테이지
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {topReviveStages.map((stage, index) => (
                                <div
                                    key={stage.stageId}
                                    className="flex items-center justify-between p-2 rounded bg-slate-900/50"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="text-lg font-bold text-slate-400 w-6">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">
                                                {stage.formattedStageId}
                                            </div>
                                            <div className="text-xs text-slate-400">
                                                {stage.totalGamesWithRevive.toLocaleString()}
                                                개 게임
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-purple-400">
                                            {stage.totalReviveEvents.toLocaleString()}
                                            회
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            평균{" "}
                                            {stage.averageRevivePerGame.toFixed(
                                                1
                                            )}
                                            회/게임
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Stage-wise Revive Events Chart */}
            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                <CardHeader>
                    <CardTitle className="text-white">
                        스테이지별 부활 현황
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        각 스테이지에서의 총 부활 이벤트 수와 부활 사용 게임 수
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#334155"
                            />
                            <XAxis
                                dataKey="formattedStageId"
                                stroke="#94a3b8"
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                interval={Math.floor(chartData.length / 20)}
                            />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#1e293b",
                                    border: "1px solid #475569",
                                    borderRadius: "0.5rem",
                                    color: "#f1f5f9",
                                }}
                                formatter={(value: number, name: string) => {
                                    const labels: Record<string, string> = {
                                        totalReviveEvents: "총 부활 이벤트",
                                        totalGamesWithRevive: "부활 사용 게임",
                                    };
                                    return [
                                        value.toLocaleString(),
                                        labels[name] || name,
                                    ];
                                }}
                            />
                            <Legend
                                formatter={(value: string) => {
                                    const labels: Record<string, string> = {
                                        totalReviveEvents: "총 부활 이벤트",
                                        totalGamesWithRevive: "부활 사용 게임",
                                    };
                                    return labels[value] || value;
                                }}
                                wrapperStyle={{ color: "#94a3b8" }}
                            />
                            <Bar
                                dataKey="totalReviveEvents"
                                fill="#8b5cf6"
                                name="totalReviveEvents"
                            />
                            <Bar
                                dataKey="totalGamesWithRevive"
                                fill="#3b82f6"
                                name="totalGamesWithRevive"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Detailed Stats Table */}
            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                <CardHeader>
                    <CardTitle className="text-white">
                        상세 스테이지 부활 통계
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        모든 스테이지의 부활 횟수 분포 통계
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b border-slate-700">
                                <tr className="text-slate-300">
                                    <th className="text-left p-2">스테이지</th>
                                    <th className="text-right p-2">총 부활</th>
                                    <th className="text-right p-2">
                                        부활 게임
                                    </th>
                                    <th className="text-right p-2">
                                        평균 부활/게임
                                    </th>
                                    <th className="text-right p-2">1회</th>
                                    <th className="text-right p-2">2회</th>
                                    <th className="text-right p-2">3회</th>
                                    <th className="text-right p-2">4회+</th>
                                    <th className="text-left p-2">부활 타입</th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-300">
                                {chartData.map((stage) => {
                                    // Get revive count distribution
                                    const getCountForRevive = (
                                        count: number
                                    ) => {
                                        const found =
                                            stage.reviveCountDistribution.find(
                                                (d) => d.reviveCount === count
                                            );
                                        return found ? found.gameCount : 0;
                                    };
                                    const fourPlusCount =
                                        stage.reviveCountDistribution
                                            .filter((d) => d.reviveCount >= 4)
                                            .reduce(
                                                (sum, d) => sum + d.gameCount,
                                                0
                                            );

                                    // Format revive types
                                    const reviveTypes = Object.entries(
                                        stage.reviveTypeDistribution
                                    )
                                        .map(
                                            ([type, count]) =>
                                                `${type}: ${count}`
                                        )
                                        .join(", ");

                                    return (
                                        <tr
                                            key={stage.stageId}
                                            className="border-b border-slate-800 hover:bg-slate-900/50"
                                        >
                                            <td className="p-2 font-medium text-white">
                                                {stage.formattedStageId}
                                            </td>
                                            <td className="text-right p-2 text-purple-400">
                                                {stage.totalReviveEvents.toLocaleString()}
                                            </td>
                                            <td className="text-right p-2">
                                                {stage.totalGamesWithRevive.toLocaleString()}
                                            </td>
                                            <td className="text-right p-2">
                                                {stage.averageRevivePerGame.toFixed(
                                                    2
                                                )}
                                            </td>
                                            <td className="text-right p-2 text-green-400">
                                                {getCountForRevive(
                                                    1
                                                ).toLocaleString()}
                                            </td>
                                            <td className="text-right p-2 text-yellow-400">
                                                {getCountForRevive(
                                                    2
                                                ).toLocaleString()}
                                            </td>
                                            <td className="text-right p-2 text-orange-400">
                                                {getCountForRevive(
                                                    3
                                                ).toLocaleString()}
                                            </td>
                                            <td className="text-right p-2 text-red-400">
                                                {fourPlusCount.toLocaleString()}
                                            </td>
                                            <td className="p-2 text-xs text-slate-400 max-w-[200px] truncate">
                                                {reviveTypes || "-"}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
