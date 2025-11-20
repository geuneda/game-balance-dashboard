'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';
import { GameEvent } from '@/types/game-data';
import { calculateFunnelData, calculateStageSpecificFunnelData, getStageIds, formatStageId } from '@/lib/data-processor';
import { Users, TrendingDown, Target } from 'lucide-react';

interface FunnelAnalysisProps {
  events: GameEvent[];
}

export default function FunnelAnalysis({ events }: FunnelAnalysisProps) {
  const [selectedStage, setSelectedStage] = useState<string>('all');

  const stageIds = useMemo(() => getStageIds(events), [events]);

  const funnelData = useMemo(() => {
    if (selectedStage === 'all') {
      return calculateFunnelData(events);
    }
    return calculateStageSpecificFunnelData(events, selectedStage);
  }, [events, selectedStage]);
  const chartData = funnelData.map(data => ({
    level: `Lv ${data.level}`,
    remaining: data.remaining,
    dropped: data.dropped,
    dropRate: parseFloat(data.dropRate.toFixed(1)),
    retentionRate: data.remaining > 0 ? parseFloat(((data.remaining / funnelData[0].remaining) * 100).toFixed(1)) : 0
  }));

  const totalPlayers = funnelData[0]?.remaining || 0;
  const finishers = funnelData[funnelData.length - 1]?.remaining || 0;
  const overallRetention = totalPlayers > 0 ? (finishers / totalPlayers) * 100 : 0;

  // Find critical drop-off points (drop rate > 15%)
  const criticalDropoffs = chartData
    .map((data, index) => ({
      ...data,
      index: index + 1
    }))
    .filter(data => data.dropRate > 15)
    .sort((a, b) => b.dropRate - a.dropRate);

  return (
    <div className="grid grid-cols-1 gap-4">
      {/* Stage Selector */}
      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-slate-400" />
              <label className="text-sm font-medium text-white">
                스테이지 선택
              </label>
            </div>
            <Select value={selectedStage} onValueChange={setSelectedStage}>
              <SelectTrigger className="w-[200px] bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="스테이지 선택" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all" className="text-white hover:bg-slate-700">
                  전체 스테이지
                </SelectItem>
                {stageIds.map(stageId => (
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
            {selectedStage !== 'all' && (
              <span className="text-xs text-slate-400">
                {formatStageId(selectedStage)}의 퍼널 데이터를 표시하고 있습니다
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              시작 플레이어
            </CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalPlayers}</div>
            <p className="text-xs text-slate-400 mt-1">전체 시도 횟수</p>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              완주 플레이어
            </CardTitle>
            <Users className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{finishers}</div>
            <p className="text-xs text-slate-400 mt-1">
              레벨 20 도달
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              전체 리텐션
            </CardTitle>
            <TrendingDown className={`h-4 w-4 ${overallRetention >= 50 ? 'text-green-400' : 'text-red-400'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${overallRetention >= 50 ? 'text-green-400' : 'text-yellow-400'}`}>
              {overallRetention.toFixed(1)}%
            </div>
            <p className="text-xs text-slate-400 mt-1">
              끝까지 완주한 비율
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Drop-offs */}
      {criticalDropoffs.length > 0 && (
        <Card className="border-red-700 bg-red-900/20 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-red-400">주요 패배 구간</CardTitle>
            <CardDescription className="text-red-300/70">
              15% 이상의 플레이어가 실패한 레벨
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {criticalDropoffs.slice(0, 6).map((data) => (
                <div key={data.level} className="bg-slate-800/50 rounded-lg p-4">
                  <div className="text-xl font-bold text-red-400">
                    {data.level}
                  </div>
                  <div className="text-sm text-slate-300 mt-1">
                    실패: <span className="font-semibold">{data.dropped}명</span>
                  </div>
                  <div className="text-xs text-red-400 mt-1">
                    실패율: {data.dropRate}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Player Retention Funnel */}
      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">플레이어 리텐션 퍼널</CardTitle>
          <CardDescription className="text-slate-400">
            각 레벨에서 남아있는 플레이어 수
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                type="number"
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8' }}
              />
              <YAxis
                type="category"
                dataKey="level"
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
              />
              <Legend />
              <Bar dataKey="remaining" name="남은 플레이어" fill="#3b82f6">
                {chartData.map((entry, index) => {
                  const opacity = 0.3 + (entry.retentionRate / 100) * 0.7;
                  return <Cell key={`cell-${index}`} fillOpacity={opacity} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Drop Rate by Level */}
      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">레벨별 실패율</CardTitle>
          <CardDescription className="text-slate-400">
            각 레벨에서의 플레이어 실패 비율
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="level"
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8' }}
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
              <Line
                type="monotone"
                dataKey="dropRate"
                stroke="#ef4444"
                strokeWidth={2}
                name="실패율 (%)"
                dot={{ fill: '#ef4444', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Retention Rate Curve */}
      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">누적 리텐션율</CardTitle>
          <CardDescription className="text-slate-400">
            시작 대비 현재 레벨까지 남아있는 플레이어 비율
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="level"
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8' }}
              />
              <YAxis
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8' }}
                domain={[0, 100]}
                label={{ value: '리텐션율 (%)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
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
                <linearGradient id="colorRetention" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <Line
                type="monotone"
                dataKey="retentionRate"
                stroke="#10b981"
                strokeWidth={3}
                name="리텐션율 (%)"
                dot={{ fill: '#10b981', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Table */}
      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">레벨별 상세 데이터</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-300 font-medium">레벨</th>
                  <th className="text-right py-3 px-4 text-slate-300 font-medium">남은 플레이어</th>
                  <th className="text-right py-3 px-4 text-slate-300 font-medium">실패 플레이어</th>
                  <th className="text-right py-3 px-4 text-slate-300 font-medium">실패율</th>
                  <th className="text-right py-3 px-4 text-slate-300 font-medium">누적 리텐션</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((data) => (
                  <tr
                    key={data.level}
                    className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="py-3 px-4 text-white font-medium">{data.level}</td>
                    <td className="text-right py-3 px-4 text-blue-400">{data.remaining}</td>
                    <td className="text-right py-3 px-4 text-red-400">{data.dropped}</td>
                    <td className="text-right py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          data.dropRate >= 20
                            ? 'bg-red-500/20 text-red-400'
                            : data.dropRate >= 10
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-green-500/20 text-green-400'
                        }`}
                      >
                        {data.dropRate}%
                      </span>
                    </td>
                    <td className="text-right py-3 px-4 text-slate-300">
                      {data.retentionRate}%
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
