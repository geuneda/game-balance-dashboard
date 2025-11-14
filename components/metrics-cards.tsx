'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Target, Layers } from 'lucide-react';

interface MetricsCardsProps {
  totalEvents: number;
  overallClearRate: number;
  voluntaryExitRate: number;
  totalStages: number;
}

export default function MetricsCards({
  totalEvents,
  overallClearRate,
  voluntaryExitRate,
  totalStages
}: MetricsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-300">
            총 이벤트 수
          </CardTitle>
          <Layers className="h-4 w-4 text-slate-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{totalEvents.toLocaleString()}</div>
          <p className="text-xs text-slate-400 mt-1">
            분석된 게임 이벤트
          </p>
        </CardContent>
      </Card>

      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-300">
            전체 클리어율
          </CardTitle>
          {overallClearRate >= 50 ? (
            <TrendingUp className="h-4 w-4 text-green-400" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-400" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${overallClearRate >= 50 ? 'text-green-400' : 'text-yellow-400'}`}>
            {overallClearRate.toFixed(1)}%
          </div>
          <p className="text-xs text-slate-400 mt-1">
            모든 스테이지 평균
          </p>
        </CardContent>
      </Card>

      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-300">
            자발적 포기율
          </CardTitle>
          <Target className="h-4 w-4 text-slate-400" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${voluntaryExitRate > 30 ? 'text-red-400' : 'text-blue-400'}`}>
            {voluntaryExitRate.toFixed(1)}%
          </div>
          <p className="text-xs text-slate-400 mt-1">
            실패 중 자발적 이탈
          </p>
        </CardContent>
      </Card>

      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-300">
            총 스테이지 수
          </CardTitle>
          <Layers className="h-4 w-4 text-slate-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{totalStages}</div>
          <p className="text-xs text-slate-400 mt-1">
            분석된 스테이지
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
