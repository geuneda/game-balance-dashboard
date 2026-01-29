"use client";

import { useState, useMemo } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { TableHeaderTooltip } from "@/components/ui/info-tooltip";
import { UserStageStats, StageReviveStats, GameEvent, ReviveEvent, ReviveGroup } from "@/types/game-data";
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ComposedChart,
} from "recharts";
import { formatStageId, calculateUserStageStatsByReviveGroup, getReviveGroupDistribution } from "@/lib/data-processor";

interface Props {
    data: UserStageStats[];
    reviveStats?: StageReviveStats[];
    events?: GameEvent[];
    reviveEvents?: ReviveEvent[];
}

export function UserStageAnalysis({ data, reviveStats = [], events = [], reviveEvents = [] }: Props) {
    const [selectedReviveGroup, setSelectedReviveGroup] = useState<ReviveGroup>("all");

    // Check if revive events exist
    const hasReviveData = reviveEvents.length > 0;

    // Get revive group distribution for tab labels
    const reviveGroupDistribution = useMemo(() => {
        if (!hasReviveData || events.length === 0) return [];
        return getReviveGroupDistribution(events, reviveEvents);
    }, [events, reviveEvents, hasReviveData]);

    // Calculate stats for the selected revive group
    const filteredData = useMemo(() => {
        if (!hasReviveData || selectedReviveGroup === "all" || events.length === 0) {
            return data;
        }
        return calculateUserStageStatsByReviveGroup(events, reviveEvents, selectedReviveGroup);
    }, [data, events, reviveEvents, selectedReviveGroup, hasReviveData]);

    // Create a map for quick revive stats lookup by stageId
    const reviveStatsMap = new Map<string, StageReviveStats>();
    reviveStats.forEach((stat) => {
        reviveStatsMap.set(stat.stageId, stat);
    });
    // 차트 데이터에 포맷팅된 스테이지 이름 추가
    const chartData = filteredData.map((stage) => ({
        ...stage,
        formattedStageId: formatStageId(stage.stageId),
    }));

    // Find stages with highest/lowest user clear rates
    const topClearRateStages = [...chartData]
        .sort((a, b) => b.userClearRate - a.userClearRate)
        .slice(0, 5);

    const lowestClearRateStages = [...chartData]
        .filter((d) => d.userClearRate > 0)
        .sort((a, b) => a.userClearRate - b.userClearRate)
        .slice(0, 5);

    // Calculate overall metrics
    const totalUniqueUsers = new Set(
        data.flatMap((stage) => Array(stage.uniqueUsers).fill(stage.stageId))
    ).size;
    const avgClearRate =
        data.length > 0
            ? data.reduce((sum, stage) => sum + stage.userClearRate, 0) /
              data.length
            : 0;
    const avgClearProbability =
        data.length > 0
            ? data.reduce((sum, stage) => sum + stage.clearProbability, 0) /
              data.length
            : 0;
    const avgAttemptsPerUser =
        data.length > 0
            ? data.reduce(
                  (sum, stage) => sum + stage.averageAttemptsPerUser,
                  0
              ) / data.length
            : 0;

    return (
        <div className="space-y-6">
            {/* Revive Group Sub-tabs */}
            {hasReviveData && reviveGroupDistribution.length > 0 && (
                <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                    <CardContent className="py-4">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-sm font-medium text-slate-300">부활 횟수별 필터:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {reviveGroupDistribution.map((group) => (
                                <button
                                    key={group.group}
                                    onClick={() => setSelectedReviveGroup(group.group)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        selectedReviveGroup === group.group
                                            ? "bg-blue-600 text-white"
                                            : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                    }`}
                                >
                                    {group.label}
                                    <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-slate-600/50">
                                        {group.userCount.toLocaleString()}명
                                    </span>
                                </button>
                            ))}
                        </div>
                        {selectedReviveGroup !== "all" && (
                            <p className="text-xs text-blue-400 mt-3">
                                * 선택한 부활 그룹({reviveGroupDistribution.find(g => g.group === selectedReviveGroup)?.label})에 속한 유저들의 데이터만 표시됩니다.
                            </p>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* No revive data message */}
            {!hasReviveData && (
                <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                    <CardContent className="py-4">
                        <p className="text-sm text-slate-400">
                            ⓘ 부활 데이터가 없는 데이터셋입니다. 부활 횟수별 필터는 부활 이벤트가 포함된 데이터에서만 사용할 수 있습니다.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-300">
                            총 유니크 사용자
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            {totalUniqueUsers.toLocaleString()}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            전체 스테이지
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-300">
                            평균 통과율
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            {avgClearRate.toFixed(1)}%
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            사용자 기준
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-300">
                            평균 클리어 확률
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            {avgClearProbability.toFixed(1)}%
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            시도 횟수 기준
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-300">
                            평균 시도 횟수
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            {avgAttemptsPerUser.toFixed(1)}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            사용자당 평균
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-300">
                            총 스테이지 수
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            {data.length}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            분석된 스테이지
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* User Engagement Chart - Users per Stage */}
            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                <CardHeader>
                    <CardTitle className="text-white">
                        스테이지별 유니크 사용자 수
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        각 스테이지에 시도한 고유 사용자 수
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
                                        uniqueUsers: "유니크 사용자",
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
                                        uniqueUsers: "유니크 사용자",
                                    };
                                    return labels[value] || value;
                                }}
                                wrapperStyle={{ color: "#94a3b8" }}
                            />
                            <Bar
                                dataKey="uniqueUsers"
                                fill="#3b82f6"
                                name="uniqueUsers"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* User Pass Rate Chart */}
            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                <CardHeader>
                    <CardTitle className="text-white">
                        스테이지별 통과율 및 클리어 확률
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        통과율: 유니크 사용자 기준 / 클리어 확률: 시도 횟수 기준
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <ComposedChart data={chartData}>
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
                            <YAxis
                                yAxisId="left"
                                stroke="#94a3b8"
                                label={{
                                    value: "통과율 (%)",
                                    angle: -90,
                                    position: "insideLeft",
                                    fill: "#94a3b8",
                                }}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                stroke="#94a3b8"
                                label={{
                                    value: "사용자 수",
                                    angle: 90,
                                    position: "insideRight",
                                    fill: "#94a3b8",
                                }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#1e293b",
                                    border: "1px solid #475569",
                                    borderRadius: "0.5rem",
                                    color: "#f1f5f9",
                                }}
                                formatter={(value: number, name: string) => {
                                    const labels: Record<string, string> = {
                                        userClearRate: "통과율",
                                        clearProbability: "클리어 확률",
                                        usersCleared: "클리어한 사용자",
                                        usersFailed: "실패한 사용자",
                                    };
                                    const formattedValue =
                                        name === "userClearRate" ||
                                        name === "clearProbability"
                                            ? `${value.toFixed(1)}%`
                                            : value.toLocaleString();
                                    return [
                                        formattedValue,
                                        labels[name] || name,
                                    ];
                                }}
                            />
                            <Legend
                                formatter={(value: string) => {
                                    const labels: Record<string, string> = {
                                        userClearRate: "통과율",
                                        clearProbability: "클리어 확률",
                                        usersCleared: "클리어한 사용자",
                                        usersFailed: "실패한 사용자",
                                    };
                                    return labels[value] || value;
                                }}
                                wrapperStyle={{ color: "#94a3b8" }}
                            />
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="userClearRate"
                                stroke="#10b981"
                                strokeWidth={2}
                                name="userClearRate"
                            />
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="clearProbability"
                                stroke="#f59e0b"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                name="clearProbability"
                            />
                            <Bar
                                yAxisId="right"
                                dataKey="usersCleared"
                                fill="#3b82f6"
                                name="usersCleared"
                            />
                            <Bar
                                yAxisId="right"
                                dataKey="usersFailed"
                                fill="#ef4444"
                                name="usersFailed"
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Average Attempts per User Chart */}
            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                <CardHeader>
                    <CardTitle className="text-white">
                        스테이지별 평균 시도 횟수
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        사용자당 스테이지 시도 평균 횟수
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
                                        averageAttemptsPerUser:
                                            "평균 시도 횟수",
                                    };
                                    return [
                                        value.toFixed(2),
                                        labels[name] || name,
                                    ];
                                }}
                            />
                            <Legend
                                formatter={(value: string) => {
                                    const labels: Record<string, string> = {
                                        averageAttemptsPerUser:
                                            "평균 시도 횟수",
                                    };
                                    return labels[value] || value;
                                }}
                                wrapperStyle={{ color: "#94a3b8" }}
                            />
                            <Bar
                                dataKey="averageAttemptsPerUser"
                                fill="#8b5cf6"
                                name="averageAttemptsPerUser"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Top/Bottom Performers Tables */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Highest Clear Rate Stages */}
                <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                    <CardHeader>
                        <CardTitle className="text-white">
                            통과율 상위 스테이지
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            통과율이 가장 높은 스테이지
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {topClearRateStages.map((stage, index) => (
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
                                                {stage.uniqueUsers.toLocaleString()}
                                                명 시도
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-green-400">
                                            {stage.userClearRate.toFixed(1)}%
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            {stage.usersCleared}명 클리어
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Lowest Clear Rate Stages */}
                <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                    <CardHeader>
                        <CardTitle className="text-white">
                            통과율 하위 스테이지
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            통과율이 가장 낮은 스테이지
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {lowestClearRateStages.map((stage, index) => (
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
                                                {stage.uniqueUsers.toLocaleString()}
                                                명 시도
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-red-400">
                                            {stage.userClearRate.toFixed(1)}%
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            {stage.usersCleared}명 클리어
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Stats Table */}
            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                <CardHeader>
                    <CardTitle className="text-white">
                        상세 스테이지 통계
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        모든 스테이지의 사용자 기반 통계
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b border-slate-700">
                                <tr className="text-slate-300">
                                    <th className="text-left p-2">스테이지</th>
                                    <TableHeaderTooltip label="유니크 사용자" description="해당 스테이지에 시도한 고유 사용자 수 (User ID 기준)" />
                                    <TableHeaderTooltip label="총 시도" description="총 클리어 + 총 실패 횟수. 해당 스테이지의 모든 게임 결과 수" />
                                    <TableHeaderTooltip label="총 클리어" description="클리어 이벤트 총 개수. 한 사용자가 여러 번 클리어할 수 있음" />
                                    <TableHeaderTooltip label="클리어한 사용자" description="1회 이상 클리어한 유니크 사용자 수" />
                                    <TableHeaderTooltip label="실패한 사용자" description="1회 이상 실패한 유니크 사용자 수 (클리어한 사용자와 중복 가능)" />
                                    <TableHeaderTooltip label="통과율" description="클리어한 사용자 ÷ 유니크 사용자 × 100. 유저 기준 통과율" />
                                    <TableHeaderTooltip label="클리어 확률" description="총 클리어 ÷ 총 시도 × 100. 시도 횟수 기준 클리어 확률" />
                                    <TableHeaderTooltip label="평균 시도" description="총 시도 ÷ 유니크 사용자. 사용자당 평균 게임 횟수" />
                                    <TableHeaderTooltip label="자발적 종료" description="자발적으로 게임을 종료(voluntary_exit)한 유니크 사용자 수" />
                                    <TableHeaderTooltip label="반복 플레이" description="반복 플레이(is_repeat_play=true)로 기록된 유니크 사용자 수" />
                                    <TableHeaderTooltip label="부활 1회" description="정확히 1회만 부활하고 게임을 끝낸 게임 수" className="text-purple-300" />
                                    <TableHeaderTooltip label="부활 2회" description="정확히 2회만 부활하고 게임을 끝낸 게임 수" className="text-purple-300" />
                                    <TableHeaderTooltip label="부활 3회" description="정확히 3회만 부활하고 게임을 끝낸 게임 수" className="text-purple-300" />
                                </tr>
                            </thead>
                            <tbody className="text-slate-300">
                                {chartData.map((stage) => {
                                    // Get revive stats for this stage
                                    const revive = reviveStatsMap.get(
                                        stage.stageId
                                    );
                                    const getReviveCount = (count: number) => {
                                        if (!revive) return 0;
                                        const found =
                                            revive.reviveCountDistribution.find(
                                                (d) => d.reviveCount === count
                                            );
                                        return found ? found.gameCount : 0;
                                    };

                                    return (
                                        <tr
                                            key={stage.stageId}
                                            className="border-b border-slate-800 hover:bg-slate-900/50"
                                        >
                                            <td className="p-2 font-medium text-white">
                                                {stage.formattedStageId}
                                            </td>
                                            <td className="text-right p-2">
                                                {stage.uniqueUsers.toLocaleString()}
                                            </td>
                                            <td className="text-right p-2">
                                                {stage.totalAttempts.toLocaleString()}
                                            </td>
                                            <td className="text-right p-2 text-green-400">
                                                {stage.totalClears.toLocaleString()}
                                            </td>
                                            <td className="text-right p-2 text-blue-400">
                                                {stage.usersCleared.toLocaleString()}
                                            </td>
                                            <td className="text-right p-2 text-red-400">
                                                {stage.usersFailed.toLocaleString()}
                                            </td>
                                            <td className="text-right p-2">
                                                <span
                                                    className={
                                                        stage.userClearRate >=
                                                        70
                                                            ? "text-green-400"
                                                            : stage.userClearRate >=
                                                              50
                                                            ? "text-yellow-400"
                                                            : "text-red-400"
                                                    }
                                                >
                                                    {stage.userClearRate.toFixed(
                                                        1
                                                    )}
                                                    %
                                                </span>
                                            </td>
                                            <td className="text-right p-2">
                                                <span
                                                    className={
                                                        stage.clearProbability >=
                                                        70
                                                            ? "text-green-400"
                                                            : stage.clearProbability >=
                                                              50
                                                            ? "text-yellow-400"
                                                            : "text-red-400"
                                                    }
                                                >
                                                    {stage.clearProbability.toFixed(
                                                        1
                                                    )}
                                                    %
                                                </span>
                                            </td>
                                            <td className="text-right p-2">
                                                {stage.averageAttemptsPerUser.toFixed(
                                                    2
                                                )}
                                            </td>
                                            <td className="text-right p-2 text-slate-400">
                                                {stage.usersWithVoluntaryExit.toLocaleString()}
                                            </td>
                                            <td className="text-right p-2 text-slate-400">
                                                {stage.usersWithRepeatPlay.toLocaleString()}
                                            </td>
                                            <td className="text-right p-2 text-green-400">
                                                {revive
                                                    ? getReviveCount(
                                                          1
                                                      ).toLocaleString()
                                                    : "-"}
                                            </td>
                                            <td className="text-right p-2 text-yellow-400">
                                                {revive
                                                    ? getReviveCount(
                                                          2
                                                      ).toLocaleString()
                                                    : "-"}
                                            </td>
                                            <td className="text-right p-2 text-orange-400">
                                                {revive
                                                    ? getReviveCount(
                                                          3
                                                      ).toLocaleString()
                                                    : "-"}
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
