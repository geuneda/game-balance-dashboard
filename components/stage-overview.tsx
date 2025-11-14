'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { StageStats } from '@/types/game-data';

interface StageOverviewProps {
  stageStats: StageStats[];
}

export default function StageOverview({ stageStats }: StageOverviewProps) {
  const chartData = stageStats.map(stat => ({
    stage: `Stage ${stat.stageId}`,
    clearRate: parseFloat(stat.clearRate.toFixed(1)),
    attempts: stat.totalAttempts,
    clears: stat.clears,
    fails: stat.fails,
    avgFailLevel: parseFloat(stat.averageFailLevel.toFixed(1))
  }));

  const getColorByRate = (rate: number) => {
    if (rate >= 70) return '#10b981'; // green
    if (rate >= 50) return '#3b82f6'; // blue
    if (rate >= 30) return '#f59e0b'; // orange
    return '#ef4444'; // red
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Clear Rate Chart */}
      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">스테이지별 클리어율</CardTitle>
          <CardDescription className="text-slate-400">
            각 스테이지의 성공률을 한눈에 확인
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="stage"
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8' }}
              />
              <YAxis
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8' }}
                label={{ value: '%', position: 'insideLeft', fill: '#94a3b8' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Bar dataKey="clearRate" name="클리어율 (%)">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColorByRate(entry.clearRate)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Average Fail Level Chart */}
      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">평균 실패 레벨</CardTitle>
          <CardDescription className="text-slate-400">
            플레이어들이 주로 어느 레벨에서 실패하는지 분석
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="stage"
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8' }}
              />
              <YAxis
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8' }}
                domain={[0, 20]}
                label={{ value: 'Level', position: 'insideLeft', fill: '#94a3b8' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Bar dataKey="avgFailLevel" name="평균 실패 레벨" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Stats Table */}
      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-white">상세 통계</CardTitle>
          <CardDescription className="text-slate-400">
            스테이지별 세부 데이터
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-300 font-medium">스테이지</th>
                  <th className="text-right py-3 px-4 text-slate-300 font-medium">시도</th>
                  <th className="text-right py-3 px-4 text-slate-300 font-medium">클리어</th>
                  <th className="text-right py-3 px-4 text-slate-300 font-medium">실패</th>
                  <th className="text-right py-3 px-4 text-slate-300 font-medium">자발적 포기</th>
                  <th className="text-right py-3 px-4 text-slate-300 font-medium">클리어율</th>
                  <th className="text-right py-3 px-4 text-slate-300 font-medium">평균 실패 Lv</th>
                </tr>
              </thead>
              <tbody>
                {stageStats.map((stat, index) => (
                  <tr
                    key={stat.stageId}
                    className={`border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors`}
                  >
                    <td className="py-3 px-4 text-white font-medium">
                      Stage {stat.stageId}
                    </td>
                    <td className="text-right py-3 px-4 text-slate-300">
                      {stat.totalAttempts}
                    </td>
                    <td className="text-right py-3 px-4 text-green-400">
                      {stat.clears}
                    </td>
                    <td className="text-right py-3 px-4 text-red-400">
                      {stat.fails}
                    </td>
                    <td className="text-right py-3 px-4 text-yellow-400">
                      {stat.voluntaryExits}
                    </td>
                    <td className="text-right py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          stat.clearRate >= 70
                            ? 'bg-green-500/20 text-green-400'
                            : stat.clearRate >= 50
                            ? 'bg-blue-500/20 text-blue-400'
                            : stat.clearRate >= 30
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {stat.clearRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-right py-3 px-4 text-slate-300">
                      {stat.averageFailLevel.toFixed(1)}
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
