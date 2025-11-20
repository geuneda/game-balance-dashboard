'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserAttritionData } from '@/types/game-data';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area } from 'recharts';
import { formatStageId } from '@/lib/data-processor';

interface Props {
  data: UserAttritionData[];
}

export function UserAttritionAnalysis({ data }: Props) {
  // 차트 데이터에 포맷팅된 스테이지 이름 추가
  const chartData = data.map(stage => ({
    ...stage,
    formattedStageId: formatStageId(stage.stageId)
  }));

  // Find stages with highest attrition
  const topAttritionStages = [...chartData]
    .filter(d => d.userAttritionRate > 0)
    .sort((a, b) => b.userAttritionRate - a.userAttritionRate)
    .slice(0, 5);

  // Calculate overall metrics
  const totalInitialUsers = data.length > 0 ? data[0].uniqueUsers : 0;
  const totalRemainingUsers = data.length > 0 ? data[data.length - 1].uniqueUsers : 0;
  const overallAttritionRate = totalInitialUsers > 0
    ? ((totalInitialUsers - totalRemainingUsers) / totalInitialUsers) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-300">초기 사용자 수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalInitialUsers.toLocaleString()}</div>
            <p className="text-xs text-slate-400 mt-1">
              첫 스테이지 시작 사용자
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-300">남은 사용자 수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalRemainingUsers.toLocaleString()}</div>
            <p className="text-xs text-slate-400 mt-1">
              마지막 스테이지 도달
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-300">전체 이탈률</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">
              {overallAttritionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {(totalInitialUsers - totalRemainingUsers).toLocaleString()}명 이탈
            </p>
          </CardContent>
        </Card>
      </div>

      {/* User Progression Chart */}
      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">스테이지별 사용자 진행 현황</CardTitle>
          <CardDescription className="text-slate-400">
            각 스테이지별 유니크 사용자 수와 이탈률 (실제 플레이어 이탈 추이)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis
                dataKey="formattedStageId"
                angle={-45}
                textAnchor="end"
                height={80}
                stroke="#94a3b8"
              />
              <YAxis yAxisId="left" label={{ value: '사용자 수', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} stroke="#94a3b8" />
              <YAxis yAxisId="right" orientation="right" label={{ value: '이탈률 (%)', angle: 90, position: 'insideRight', fill: '#94a3b8' }} stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                labelStyle={{ color: '#f1f5f9' }}
                itemStyle={{ color: '#e2e8f0' }}
                formatter={(value: number, name: string) => {
                  if (name === '유니크 사용자' || name === '이탈 사용자') {
                    return [value.toLocaleString(), name];
                  }
                  return [`${value.toFixed(1)}%`, name];
                }}
              />
              <Legend wrapperStyle={{ color: '#e2e8f0' }} />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="uniqueUsers"
                fill="#8884d8"
                stroke="#8884d8"
                fillOpacity={0.3}
                name="유니크 사용자"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="userAttritionRate"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="스테이지 이탈률"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="cumulativeAttritionRate"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 3 }}
                name="누적 이탈률"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Stage-by-Stage Attrition */}
      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">스테이지별 사용자 이탈 현황</CardTitle>
          <CardDescription className="text-slate-400">
            연속된 스테이지 사이에서 이탈한 사용자 수
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData.filter(d => d.userAttritionCount > 0)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis
                dataKey="formattedStageId"
                angle={-45}
                textAnchor="end"
                height={80}
                stroke="#94a3b8"
              />
              <YAxis label={{ value: '이탈 사용자 수', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                labelStyle={{ color: '#f1f5f9' }}
                itemStyle={{ color: '#e2e8f0' }}
                formatter={(value: number) => [value.toLocaleString(), '이탈 사용자']}
              />
              <Legend wrapperStyle={{ color: '#e2e8f0' }} />
              <Bar
                dataKey="userAttritionCount"
                fill="#ef4444"
                name="이탈 사용자"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Attrition Stages Table */}
      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">이탈률 상위 스테이지</CardTitle>
          <CardDescription className="text-slate-400">
            가장 많은 사용자가 이탈한 상위 5개 스테이지
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-slate-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-700/30">
                  <th className="p-3 text-left font-medium text-slate-300">스테이지</th>
                  <th className="p-3 text-right font-medium text-slate-300">이탈 사용자</th>
                  <th className="p-3 text-right font-medium text-slate-300">이탈률</th>
                  <th className="p-3 text-right font-medium text-slate-300">남은 사용자</th>
                </tr>
              </thead>
              <tbody>
                {topAttritionStages.map((stage, index) => (
                  <tr key={stage.stageId} className="border-b border-slate-700 last:border-0">
                    <td className="p-3 font-medium text-white">{stage.formattedStageId}</td>
                    <td className="p-3 text-right text-red-400 font-semibold">
                      {stage.userAttritionCount.toLocaleString()}
                    </td>
                    <td className="p-3 text-right text-red-400 font-semibold">
                      {stage.userAttritionRate.toFixed(1)}%
                    </td>
                    <td className="p-3 text-right text-white">
                      {stage.uniqueUsers.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Data Table */}
      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">전체 스테이지 진행 데이터</CardTitle>
          <CardDescription className="text-slate-400">
            모든 스테이지별 상세 사용자 진행 현황
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-slate-700 max-h-96 overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-700">
                <tr className="border-b border-slate-600">
                  <th className="p-3 text-left font-medium text-slate-300">스테이지</th>
                  <th className="p-3 text-right font-medium text-slate-300">유니크 사용자</th>
                  <th className="p-3 text-right font-medium text-slate-300">이탈 사용자</th>
                  <th className="p-3 text-right font-medium text-slate-300">이탈률</th>
                  <th className="p-3 text-right font-medium text-slate-300">누적 이탈률</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((stage) => (
                  <tr key={stage.stageId} className="border-b border-slate-700 last:border-0">
                    <td className="p-3 font-medium text-white">{stage.formattedStageId}</td>
                    <td className="p-3 text-right text-white">{stage.uniqueUsers.toLocaleString()}</td>
                    <td className="p-3 text-right">
                      {stage.userAttritionCount > 0 ? (
                        <span className="text-red-400 font-semibold">
                          {stage.userAttritionCount.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {stage.userAttritionRate > 0 ? (
                        <span className="text-red-400 font-semibold">
                          {stage.userAttritionRate.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="p-3 text-right text-orange-400 font-semibold">
                      {stage.cumulativeAttritionRate.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
