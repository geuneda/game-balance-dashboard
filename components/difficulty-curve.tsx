'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, ComposedChart, Bar } from 'recharts';
import { DifficultySpike } from '@/types/game-data';
import { AlertTriangle } from 'lucide-react';

interface DifficultyCurveProps {
  difficultySpikes: DifficultySpike[];
}

export default function DifficultyCurve({ difficultySpikes }: DifficultyCurveProps) {
  const chartData = difficultySpikes.map(spike => ({
    level: spike.level,
    failCount: spike.failCount,
    failRate: parseFloat(spike.failRate.toFixed(1))
  }));

  // Find significant difficulty spikes (fail rate > 20% and higher than previous level)
  const significantSpikes = difficultySpikes
    .map((spike, index) => {
      if (index === 0) return null;
      const prevSpike = difficultySpikes[index - 1];
      const increase = spike.failRate - prevSpike.failRate;
      if (spike.failRate > 20 && increase > 10) {
        return {
          level: spike.level,
          failRate: spike.failRate,
          increase: increase
        };
      }
      return null;
    })
    .filter(spike => spike !== null);

  return (
    <div className="grid grid-cols-1 gap-4">
      {/* Difficulty Spikes Alert */}
      {significantSpikes.length > 0 && (
        <Card className="border-yellow-700 bg-yellow-900/20 backdrop-blur">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              <CardTitle className="text-yellow-400">난이도 스파이크 감지</CardTitle>
            </div>
            <CardDescription className="text-yellow-300/70">
              다음 레벨에서 급격한 난이도 상승이 감지되었습니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {significantSpikes.map((spike: any) => (
                <div key={spike.level} className="bg-slate-800/50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-yellow-400">
                    Level {spike.level}
                  </div>
                  <div className="text-sm text-slate-300 mt-1">
                    실패율: <span className="font-semibold">{spike.failRate.toFixed(1)}%</span>
                  </div>
                  <div className="text-xs text-yellow-400 mt-1">
                    +{spike.increase.toFixed(1)}% 증가
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fail Rate Curve */}
      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">레벨별 실패율 곡선</CardTitle>
          <CardDescription className="text-slate-400">
            각 레벨에서의 플레이어 실패율 추이
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="level"
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8' }}
                label={{ value: 'Level', position: 'insideBottom', offset: -5, fill: '#94a3b8' }}
              />
              <YAxis
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8' }}
                label={{ value: '실패율 (%)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Legend />
              <defs>
                <linearGradient id="colorFailRate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="failRate"
                stroke="#ef4444"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorFailRate)"
                name="실패율 (%)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Fail Count by Level */}
      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">레벨별 실패 횟수</CardTitle>
          <CardDescription className="text-slate-400">
            각 레벨에서 발생한 총 실패 횟수
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="level"
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8' }}
                label={{ value: 'Level', position: 'insideBottom', offset: -5, fill: '#94a3b8' }}
              />
              <YAxis
                yAxisId="left"
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8' }}
                label={{ value: '실패 횟수', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8' }}
                label={{ value: '실패율 (%)', angle: 90, position: 'insideRight', fill: '#94a3b8' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="failCount"
                fill="#6366f1"
                name="실패 횟수"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="failRate"
                stroke="#f59e0b"
                strokeWidth={2}
                name="실패율 (%)"
                dot={{ fill: '#f59e0b', r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Level Analysis Table */}
      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">레벨별 상세 분석</CardTitle>
          <CardDescription className="text-slate-400">
            위험도가 높은 레벨을 우선적으로 표시
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-300 font-medium">레벨</th>
                  <th className="text-right py-3 px-4 text-slate-300 font-medium">실패 횟수</th>
                  <th className="text-right py-3 px-4 text-slate-300 font-medium">실패율</th>
                  <th className="text-right py-3 px-4 text-slate-300 font-medium">위험도</th>
                </tr>
              </thead>
              <tbody>
                {chartData
                  .sort((a, b) => b.failRate - a.failRate)
                  .map((data, index) => (
                    <tr
                      key={data.level}
                      className={`border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors`}
                    >
                      <td className="py-3 px-4 text-white font-medium">
                        Level {data.level}
                      </td>
                      <td className="text-right py-3 px-4 text-slate-300">
                        {data.failCount}
                      </td>
                      <td className="text-right py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            data.failRate >= 40
                              ? 'bg-red-500/20 text-red-400'
                              : data.failRate >= 25
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : data.failRate >= 15
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-green-500/20 text-green-400'
                          }`}
                        >
                          {data.failRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="text-right py-3 px-4">
                        {data.failRate >= 40 ? (
                          <span className="text-red-400 font-semibold">🔴 매우 높음</span>
                        ) : data.failRate >= 25 ? (
                          <span className="text-yellow-400 font-semibold">🟡 높음</span>
                        ) : data.failRate >= 15 ? (
                          <span className="text-blue-400">🔵 보통</span>
                        ) : (
                          <span className="text-green-400">🟢 낮음</span>
                        )}
                      </td>
                    </tr>
                  ))
                  .slice(0, 10)}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
