'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ZAxis } from 'recharts';
import { StageStats } from '@/types/game-data';

interface StageComparisonProps {
  stageStats: StageStats[];
}

export default function StageComparison({ stageStats }: StageComparisonProps) {
  // Prepare data for radar chart (showing top 5 stages)
  const topStages = [...stageStats]
    .sort((a, b) => b.clearRate - a.clearRate)
    .slice(0, 5);

  const radarData = [
    {
      metric: '클리어율',
      ...Object.fromEntries(topStages.map(s => [s.stageId, s.clearRate]))
    },
    {
      metric: '시도 횟수',
      ...Object.fromEntries(topStages.map(s => [s.stageId, (s.totalAttempts / Math.max(...stageStats.map(st => st.totalAttempts))) * 100]))
    },
    {
      metric: '실패율',
      ...Object.fromEntries(topStages.map(s => [s.stageId, s.totalAttempts > 0 ? (s.fails / s.totalAttempts) * 100 : 0]))
    },
    {
      metric: '평균 실패 레벨',
      ...Object.fromEntries(topStages.map(s => [s.stageId, (s.averageFailLevel / 20) * 100]))
    }
  ];

  // Scatter plot data: clear rate vs avg fail level
  const scatterData = stageStats.map(stat => ({
    stage: stat.stageId,
    clearRate: stat.clearRate,
    avgFailLevel: stat.averageFailLevel,
    attempts: stat.totalAttempts
  }));

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="grid grid-cols-1 gap-4">
      {/* Radar Comparison */}
      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">스테이지 종합 비교 (상위 5개)</CardTitle>
          <CardDescription className="text-slate-400">
            클리어율, 시도 횟수, 실패율, 평균 실패 레벨 비교
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={500}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis
                dataKey="metric"
                tick={{ fill: '#94a3b8' }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fill: '#94a3b8' }}
              />
              {topStages.map((stage, index) => (
                <Radar
                  key={stage.stageId}
                  name={`Stage ${stage.stageId}`}
                  dataKey={stage.stageId}
                  stroke={colors[index % colors.length]}
                  fill={colors[index % colors.length]}
                  fillOpacity={0.3}
                />
              ))}
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Scatter Plot: Clear Rate vs Avg Fail Level */}
      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">클리어율 vs 평균 실패 레벨</CardTitle>
          <CardDescription className="text-slate-400">
            난이도와 성공률의 상관관계 분석 (버블 크기 = 시도 횟수)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                type="number"
                dataKey="avgFailLevel"
                name="평균 실패 레벨"
                domain={[0, 20]}
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8' }}
                label={{ value: '평균 실패 레벨', position: 'insideBottom', offset: -10, fill: '#94a3b8' }}
              />
              <YAxis
                type="number"
                dataKey="clearRate"
                name="클리어율"
                domain={[0, 100]}
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8' }}
                label={{ value: '클리어율 (%)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
              />
              <ZAxis
                type="number"
                dataKey="attempts"
                range={[100, 1000]}
                name="시도 횟수"
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-800 border border-slate-600 rounded-lg p-3">
                        <p className="font-semibold text-white">Stage {data.stage}</p>
                        <p className="text-sm text-slate-300">클리어율: {data.clearRate.toFixed(1)}%</p>
                        <p className="text-sm text-slate-300">평균 실패 레벨: {data.avgFailLevel.toFixed(1)}</p>
                        <p className="text-sm text-slate-300">시도 횟수: {data.attempts}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter
                name="스테이지"
                data={scatterData}
                fill="#3b82f6"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Stage Rankings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Easiest Stages */}
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-green-400">🏆 가장 쉬운 스테이지</CardTitle>
            <CardDescription className="text-slate-400">
              클리어율 기준 상위 5개
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...stageStats]
                .sort((a, b) => b.clearRate - a.clearRate)
                .slice(0, 5)
                .map((stat, index) => (
                  <div
                    key={stat.stageId}
                    className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-slate-400 w-8">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-white">
                          Stage {stat.stageId}
                        </div>
                        <div className="text-xs text-slate-400">
                          시도: {stat.totalAttempts}회
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-green-400">
                        {stat.clearRate.toFixed(1)}%
                      </div>
                      <div className="text-xs text-slate-400">
                        클리어율
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Hardest Stages */}
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-red-400">⚠️ 가장 어려운 스테이지</CardTitle>
            <CardDescription className="text-slate-400">
              클리어율 기준 하위 5개
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...stageStats]
                .sort((a, b) => a.clearRate - b.clearRate)
                .slice(0, 5)
                .map((stat, index) => (
                  <div
                    key={stat.stageId}
                    className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-slate-400 w-8">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-white">
                          Stage {stat.stageId}
                        </div>
                        <div className="text-xs text-slate-400">
                          시도: {stat.totalAttempts}회
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-red-400">
                        {stat.clearRate.toFixed(1)}%
                      </div>
                      <div className="text-xs text-slate-400">
                        클리어율
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Voluntary Exit Analysis */}
      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-yellow-400">🚪 자발적 포기율이 높은 스테이지</CardTitle>
          <CardDescription className="text-slate-400">
            플레이어가 스스로 게임을 그만둔 비율이 높은 스테이지
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-300 font-medium">순위</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-medium">스테이지</th>
                  <th className="text-right py-3 px-4 text-slate-300 font-medium">총 실패</th>
                  <th className="text-right py-3 px-4 text-slate-300 font-medium">자발적 포기</th>
                  <th className="text-right py-3 px-4 text-slate-300 font-medium">자발적 포기율</th>
                </tr>
              </thead>
              <tbody>
                {stageStats
                  .filter(stat => stat.fails > 0)
                  .map(stat => ({
                    ...stat,
                    voluntaryExitRate: (stat.voluntaryExits / stat.fails) * 100
                  }))
                  .sort((a, b) => b.voluntaryExitRate - a.voluntaryExitRate)
                  .slice(0, 10)
                  .map((stat, index) => (
                    <tr
                      key={stat.stageId}
                      className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="py-3 px-4 text-slate-400 font-medium">
                        #{index + 1}
                      </td>
                      <td className="py-3 px-4 text-white font-medium">
                        Stage {stat.stageId}
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
                            stat.voluntaryExitRate >= 50
                              ? 'bg-red-500/20 text-red-400'
                              : stat.voluntaryExitRate >= 30
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-green-500/20 text-green-400'
                          }`}
                        >
                          {stat.voluntaryExitRate.toFixed(1)}%
                        </span>
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
