'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GameEvent, FirstClearStageData } from '@/types/game-data';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { calculateFirstClearByTryCount, getStageIds, formatStageId } from '@/lib/data-processor';

interface Props {
  events: GameEvent[];
}

export function FirstClearAnalysis({ events }: Props) {
  const stageIds = useMemo(() => getStageIds(events), [events]);
  const [selectedStageId, setSelectedStageId] = useState<string>(stageIds[0] || '');

  const stageData: FirstClearStageData | null = useMemo(() => {
    if (!selectedStageId) return null;
    return calculateFirstClearByTryCount(events, selectedStageId);
  }, [events, selectedStageId]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    if (!stageData || stageData.byTryCount.length === 0) {
      return {
        totalUsers: 0,
        avgTryCount: 0,
        oneShot: 0,
        oneShotPercent: 0,
        maxTryCount: 0,
        maxTryCountUsers: 0
      };
    }

    const totalUsers = stageData.totalFirstClearUsers;
    const totalTries = stageData.byTryCount.reduce((sum, item) => sum + (item.tryCount * item.userCount), 0);
    const avgTryCount = totalUsers > 0 ? totalTries / totalUsers : 0;
    const oneShotData = stageData.byTryCount.find(item => item.tryCount === 1);
    const oneShot = oneShotData?.userCount || 0;
    const oneShotPercent = totalUsers > 0 ? (oneShot / totalUsers) * 100 : 0;

    const maxTryCountItem = stageData.byTryCount[stageData.byTryCount.length - 1];
    const maxTryCount = maxTryCountItem?.tryCount || 0;
    const maxTryCountUsers = maxTryCountItem?.userCount || 0;

    return {
      totalUsers,
      avgTryCount,
      oneShot,
      oneShotPercent,
      maxTryCount,
      maxTryCountUsers
    };
  }, [stageData]);

  // Prepare chart data with color coding
  const chartData = useMemo(() => {
    if (!stageData) return [];
    return stageData.byTryCount.map(item => ({
      ...item,
      label: `${item.tryCount}회`,
      fill: item.tryCount === 1 ? '#10b981' : item.tryCount <= 3 ? '#3b82f6' : item.tryCount <= 5 ? '#f59e0b' : '#ef4444'
    }));
  }, [stageData]);

  if (stageIds.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-400">데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stage Selector */}
      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">첫 클리어 분석</CardTitle>
          <CardDescription className="text-slate-400">
            스테이지별 첫 클리어(IsFirstClear) 사용자의 시도 횟수 분포를 확인합니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-slate-300">스테이지 선택:</label>
            <Select value={selectedStageId} onValueChange={setSelectedStageId}>
              <SelectTrigger className="w-[200px] bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="스테이지 선택..." />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 max-h-[300px]">
                {stageIds.map((stageId) => (
                  <SelectItem
                    key={stageId}
                    value={stageId}
                    className="text-white hover:bg-slate-700"
                  >
                    {formatStageId(stageId)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {stageData && (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-300">총 첫 클리어 사용자</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{summaryStats.totalUsers.toLocaleString()}</div>
                <p className="text-xs text-slate-400 mt-1">
                  {formatStageId(selectedStageId)}
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-300">평균 시도 횟수</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{summaryStats.avgTryCount.toFixed(2)}회</div>
                <p className="text-xs text-slate-400 mt-1">
                  첫 클리어까지 평균
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-300">원샷 클리어</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">{summaryStats.oneShot.toLocaleString()}</div>
                <p className="text-xs text-slate-400 mt-1">
                  {summaryStats.oneShotPercent.toFixed(1)}% (1회 시도 클리어)
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-300">최대 시도 횟수</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-400">{summaryStats.maxTryCount}회</div>
                <p className="text-xs text-slate-400 mt-1">
                  {summaryStats.maxTryCountUsers}명
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-300">시도 분포</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stageData.byTryCount.length}</div>
                <p className="text-xs text-slate-400 mt-1">
                  서로 다른 시도 횟수
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Bar Chart */}
          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white">시도 횟수별 첫 클리어 사용자 분포</CardTitle>
              <CardDescription className="text-slate-400">
                {formatStageId(selectedStageId)} - 각 시도 횟수에서 첫 클리어를 달성한 유니크 사용자 수
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      dataKey="label"
                      stroke="#94a3b8"
                      angle={chartData.length > 15 ? -45 : 0}
                      textAnchor={chartData.length > 15 ? "end" : "middle"}
                      height={chartData.length > 15 ? 60 : 30}
                    />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '0.5rem',
                        color: '#f1f5f9'
                      }}
                      formatter={(value: number) => [`${value.toLocaleString()}명`, '첫 클리어 사용자']}
                      labelFormatter={(label) => `${label} 시도`}
                    />
                    <Legend
                      formatter={() => '첫 클리어 사용자'}
                      wrapperStyle={{ color: '#94a3b8' }}
                    />
                    <Bar dataKey="userCount" name="userCount">
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <p className="text-slate-400">이 스테이지에 첫 클리어 데이터가 없습니다.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detailed Table */}
          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white">상세 데이터</CardTitle>
              <CardDescription className="text-slate-400">
                시도 횟수별 첫 클리어 사용자 수 및 비율
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stageData.byTryCount.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-slate-700">
                      <tr className="text-slate-300">
                        <th className="text-left p-3">시도 횟수</th>
                        <th className="text-right p-3">첫 클리어 사용자</th>
                        <th className="text-right p-3">비율</th>
                        <th className="text-right p-3">누적 비율</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-300">
                      {(() => {
                        let cumulativeCount = 0;
                        return stageData.byTryCount.map((item) => {
                          cumulativeCount += item.userCount;
                          const percentage = summaryStats.totalUsers > 0
                            ? (item.userCount / summaryStats.totalUsers) * 100
                            : 0;
                          const cumulativePercentage = summaryStats.totalUsers > 0
                            ? (cumulativeCount / summaryStats.totalUsers) * 100
                            : 0;

                          return (
                            <tr key={item.tryCount} className="border-b border-slate-800 hover:bg-slate-900/50">
                              <td className="p-3 font-medium text-white">
                                <span className={`inline-flex items-center gap-2 ${
                                  item.tryCount === 1 ? 'text-green-400' :
                                  item.tryCount <= 3 ? 'text-blue-400' :
                                  item.tryCount <= 5 ? 'text-yellow-400' :
                                  'text-red-400'
                                }`}>
                                  {item.tryCount}회
                                  {item.tryCount === 1 && <span className="text-xs bg-green-900/50 px-2 py-0.5 rounded">원샷</span>}
                                </span>
                              </td>
                              <td className="text-right p-3">{item.userCount.toLocaleString()}명</td>
                              <td className="text-right p-3">{percentage.toFixed(1)}%</td>
                              <td className="text-right p-3">
                                <span className={cumulativePercentage >= 80 ? 'text-green-400' : ''}>
                                  {cumulativePercentage.toFixed(1)}%
                                </span>
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                    <tfoot className="border-t border-slate-600">
                      <tr className="text-slate-200 font-semibold">
                        <td className="p-3">합계</td>
                        <td className="text-right p-3">{summaryStats.totalUsers.toLocaleString()}명</td>
                        <td className="text-right p-3">100%</td>
                        <td className="text-right p-3">-</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="flex items-center justify-center h-32">
                  <p className="text-slate-400">이 스테이지에 첫 클리어 데이터가 없습니다.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Color Legend */}
          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-white">색상 범례</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-slate-300">1회 (원샷)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-slate-300">2-3회</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span className="text-slate-300">4-5회</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-slate-300">6회 이상</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
