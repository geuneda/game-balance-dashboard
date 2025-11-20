'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StageAttritionData } from '@/types/game-data';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';
import { formatStageId } from '@/lib/data-processor';

interface AttritionAnalysisProps {
  data: StageAttritionData[];
}

export function AttritionAnalysis({ data }: AttritionAnalysisProps) {
  // 차트 데이터에 포맷팅된 스테이지 이름 추가
  const chartData = data.map(stage => ({
    ...stage,
    formattedStageId: formatStageId(stage.stageId)
  }));

  // 가장 큰 이탈이 발생한 스테이지 찾기
  const maxAttrition = data.reduce((max, curr) =>
    curr.attritionCount > max.attritionCount ? curr : max
  , data[0] || { attritionCount: 0, stageId: '', attritionRate: 0 });

  return (
    <div className="space-y-6">
      {/* 요약 카드 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">최대 이탈 스테이지</CardTitle>
            <CardDescription className="text-slate-400">플레이어가 가장 많이 이탈한 구간</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{formatStageId(maxAttrition.stageId)}</div>
            <p className="text-sm text-slate-400 mt-2">
              {maxAttrition.attritionCount.toLocaleString()}명 이탈 ({maxAttrition.attritionRate.toFixed(1)}%)
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">평균 이탈률</CardTitle>
            <CardDescription className="text-slate-400">스테이지당 평균 이탈 비율</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {(data.reduce((sum, d) => sum + d.attritionRate, 0) / data.length).toFixed(1)}%
            </div>
            <p className="text-sm text-slate-400 mt-2">
              전체 스테이지 평균
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 시도 횟수 + 이탈률 복합 차트 */}
      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">스테이지별 시도 횟수 및 이탈률</CardTitle>
          <CardDescription className="text-slate-400">
            각 스테이지의 시도 횟수(바)와 다음 스테이지로의 이탈률(선)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="formattedStageId"
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 12, fill: '#94a3b8' }}
                stroke="#94a3b8"
              />
              <YAxis
                yAxisId="left"
                label={{ value: '시도 횟수', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8' }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                label={{ value: '이탈률 (%)', angle: 90, position: 'insideRight', fill: '#94a3b8' }}
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value: number, name: string) => {
                  if (name === '시도 횟수') return [value.toLocaleString(), name];
                  if (name === '이탈률') return [`${value.toFixed(1)}%`, name];
                  return [value, name];
                }}
              />
              <Legend wrapperStyle={{ color: '#94a3b8' }} />
              <Bar
                yAxisId="left"
                dataKey="attempts"
                name="시도 횟수"
                fill="#8884d8"
                opacity={0.8}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="attritionRate"
                name="이탈률"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 이탈 인원 바 차트 */}
      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">스테이지별 이탈 인원</CardTitle>
          <CardDescription className="text-slate-400">
            각 스테이지에서 다음 스테이지로 넘어가지 않은 플레이어 수
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="formattedStageId"
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 12, fill: '#94a3b8' }}
                stroke="#94a3b8"
              />
              <YAxis
                label={{ value: '이탈 인원', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value: number) => [value.toLocaleString(), '이탈 인원']}
              />
              <Legend wrapperStyle={{ color: '#94a3b8' }} />
              <Bar
                dataKey="attritionCount"
                name="이탈 인원"
                fill="#f59e0b"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 상세 테이블 */}
      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">스테이지별 이탈 상세 데이터</CardTitle>
          <CardDescription className="text-slate-400">
            시도 횟수와 이탈 통계
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left p-2 font-medium text-slate-300">스테이지</th>
                  <th className="text-right p-2 font-medium text-slate-300">시도 횟수</th>
                  <th className="text-right p-2 font-medium text-slate-300">이탈 인원</th>
                  <th className="text-right p-2 font-medium text-slate-300">이탈률</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((stage) => (
                  <tr key={stage.stageId} className="border-b border-slate-700 hover:bg-slate-700/50 text-slate-200">
                    <td className="p-2 font-mono">{stage.formattedStageId}</td>
                    <td className="text-right p-2">
                      {stage.attempts.toLocaleString()}
                    </td>
                    <td className="text-right p-2">
                      {stage.attritionCount > 0 ? stage.attritionCount.toLocaleString() : '-'}
                    </td>
                    <td className="text-right p-2">
                      {stage.attritionRate > 0 ? `${stage.attritionRate.toFixed(1)}%` : '-'}
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
