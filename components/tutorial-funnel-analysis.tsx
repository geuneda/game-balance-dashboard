'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import { TutorialEvent, calculateTutorialFunnel, calculateTutorialStepStats, getTutorialUniqueUserCount } from '@/lib/tutorial-processor';
import { getTutorialDescription, getTutorialShortDescription } from '@/lib/tutorial-mapping';

interface Props {
  events: TutorialEvent[];
}

export function TutorialFunnelAnalysis({ events }: Props) {
  const stepStats = calculateTutorialStepStats(events);
  const funnelData = calculateTutorialFunnel(events);
  const totalUsers = getTutorialUniqueUserCount(events);

  // 특수 이벤트 분리 (63번: 패배 처리 이벤트)
  const specialEvents = stepStats.filter(stat => stat.stepId === '63');

  // 텍스트 탭 단계 제외 (01, 02, 03, 23, 37, 61)
  const textSteps = ['01', '02', '03', '23', '37', '61'];
  const normalSteps = stepStats.filter(stat =>
    stat.stepId !== '63' && !textSteps.includes(stat.stepId)
  );

  // 이상치 필터링: 이탈률이 95% 이상이거나 진행 수가 비정상적으로 적은 단계 제거
  const filteredFunnelData = funnelData.filter((data, index) => {
    // 텍스트 탭들과 특수 이벤트는 퍼널에서 제외
    if (data.stepId === '63' || textSteps.includes(data.stepId)) return false;

    // 첫 번째 단계는 항상 포함
    if (index === 0) return true;

    // 이탈률이 95% 이상인 경우 제외 (로그 누락으로 판단)
    if (data.dropoffRate >= 95) return false;

    // 이전 단계 대비 10배 이상 증가한 경우 제외 (비정상적 증가)
    const prevData = funnelData[index - 1];
    if (prevData && data.uniqueUsers > prevData.uniqueUsers * 10) return false;

    return true;
  });

  // 차트용 데이터 변환
  const chartData = filteredFunnelData.map((data) => ({
    step: getTutorialShortDescription(data.stepId),
    fullDescription: getTutorialDescription(data.stepId),
    stepId: data.stepId,
    users: data.uniqueUsers,
    dropoffRate: Number(data.dropoffRate.toFixed(2)),
    cumulativeDropoffRate: Number(data.cumulativeDropoffRate.toFixed(2)),
    dropoffCount: data.dropoffCount,
  }));

  // 위험 구간 식별 (이탈률이 10% 이상)
  const dangerousSteps = chartData
    .filter((data) => data.dropoffRate > 10)
    .sort((a, b) => b.dropoffRate - a.dropoffRate)
    .slice(0, 5);

  const completionRate = filteredFunnelData.length > 0
    ? ((filteredFunnelData[filteredFunnelData.length - 1].uniqueUsers / filteredFunnelData[0].uniqueUsers) * 100).toFixed(1)
    : '0';

  // 필터링된 단계 수 (특수 이벤트 및 텍스트 탭 제외)
  const totalNormalSteps = funnelData.filter(d =>
    d.stepId !== '63' && !textSteps.includes(d.stepId)
  ).length;
  const filteredOutCount = totalNormalSteps - filteredFunnelData.length;

  return (
    <div className="space-y-6">
      {/* Filtering Info */}
      <Card className="border-blue-600 bg-blue-50/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-blue-800">
            <span className="text-lg">ℹ️</span>
            <div>
              <p className="font-semibold">분석 범위</p>
              <p className="text-sm">
                텍스트 탭 단계(01, 02, 03, 23, 37, 61)는 사용자 행동 분석에서 제외되었습니다.
                {filteredOutCount > 0 && ` 추가로 로그 누락이 의심되는 ${filteredOutCount}개 단계가 제외되었습니다.`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">분석된 행동 단계</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredFunnelData.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              (전체 {stepStats.length}개 중 사용자 행동 단계)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">시작 진행 수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {chartData.length > 0 ? chartData[0].users.toLocaleString() : 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">마지막까지 도달</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {chartData.length > 0 ? chartData[chartData.length - 1].users.toLocaleString() : 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">행동 완료율</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              (첫 행동 대비 마지막 단계 도달률)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Danger Zones */}
      {dangerousSteps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>⚠️ 이탈 위험 구간</CardTitle>
            <CardDescription>
              이탈률이 10% 이상인 행동 단계 (이탈률 높은 순)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dangerousSteps.map((step) => (
                <div key={step.stepId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-semibold">{step.fullDescription}</div>
                    <div className="text-sm text-muted-foreground">
                      {step.dropoffCount.toLocaleString()}건 이탈 (전체 {step.users.toLocaleString()}건 중)
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-destructive">
                      {step.dropoffRate}%
                    </div>
                    <div className="text-xs text-muted-foreground">이탈률</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Special Events */}
      {specialEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>📊 특수 이벤트</CardTitle>
            <CardDescription>
              튜토리얼 플로우와 별개로 발생하는 이벤트
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {specialEvents.map((event) => (
                <div key={event.stepId} className="flex items-center justify-between p-3 border rounded-lg bg-blue-50/50">
                  <div className="flex-1">
                    <div className="font-semibold">{getTutorialDescription(event.stepId)}</div>
                    <div className="text-sm text-muted-foreground">
                      이탈률 분석과 무관한 독립 이벤트
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {event.totalEvents.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">발생 횟수</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Funnel Chart */}
      <Card>
        <CardHeader>
          <CardTitle>사용자 행동 단계별 진행 퍼널</CardTitle>
          <CardDescription>
            각 행동 단계를 진행한 횟수 추이 (텍스트 탭 제외)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="step"
                angle={-45}
                textAnchor="end"
                height={120}
                interval="preserveStartEnd"
                tick={{ fontSize: 11 }}
              />
              <YAxis />
              <Tooltip
                formatter={(value: number) => value.toLocaleString()}
                labelFormatter={(label) => {
                  const data = chartData.find(d => d.step === label);
                  return data?.fullDescription || label;
                }}
                labelStyle={{ color: '#000', fontWeight: 'bold' }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="users"
                name="진행 수"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Step-by-Step Dropoff Rate */}
      <Card>
        <CardHeader>
          <CardTitle>행동 단계별 이탈률</CardTitle>
          <CardDescription>
            이전 행동 단계 대비 현재 단계의 진행 이탈률 (텍스트 탭 제외)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="step"
                angle={-45}
                textAnchor="end"
                height={120}
                interval="preserveStartEnd"
                tick={{ fontSize: 11 }}
              />
              <YAxis
                label={{ value: '이탈률 (%)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                formatter={(value: number) => `${value}%`}
                labelFormatter={(label) => {
                  const data = chartData.find(d => d.step === label);
                  return data?.fullDescription || label;
                }}
                labelStyle={{ color: '#000', fontWeight: 'bold' }}
              />
              <Legend />
              <Bar
                dataKey="dropoffRate"
                name="이탈률"
                fill="#ef4444"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cumulative Dropoff */}
      <Card>
        <CardHeader>
          <CardTitle>누적 이탈률</CardTitle>
          <CardDescription>
            첫 행동 단계 대비 각 단계까지의 누적 이탈률 (텍스트 탭 제외)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="step"
                angle={-45}
                textAnchor="end"
                height={120}
                interval="preserveStartEnd"
                tick={{ fontSize: 11 }}
              />
              <YAxis
                label={{ value: '누적 이탈률 (%)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                formatter={(value: number) => `${value}%`}
                labelFormatter={(label) => {
                  const data = chartData.find(d => d.step === label);
                  return data?.fullDescription || label;
                }}
                labelStyle={{ color: '#000', fontWeight: 'bold' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="cumulativeDropoffRate"
                name="누적 이탈률"
                stroke="#f97316"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Stats Table */}
      <Card>
        <CardHeader>
          <CardTitle>행동 단계별 상세 통계</CardTitle>
          <CardDescription>
            각 사용자 행동 단계의 진행 수, 이탈 정보 (텍스트 탭 제외)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 min-w-[300px]">행동 단계</th>
                  <th className="text-right p-2">진행 수</th>
                  <th className="text-right p-2">이탈 수</th>
                  <th className="text-right p-2">이탈률</th>
                  <th className="text-right p-2">누적 이탈률</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((data, index) => {
                  return (
                    <tr key={data.stepId} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">{data.fullDescription}</td>
                      <td className="text-right p-2">{data.users.toLocaleString()}</td>
                      <td className="text-right p-2">
                        {data.dropoffCount > 0 ? (
                          <span className="text-destructive">
                            {data.dropoffCount.toLocaleString()}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="text-right p-2">
                        {data.dropoffRate > 0 ? (
                          <span className={data.dropoffRate > 10 ? 'text-destructive font-semibold' : ''}>
                            {data.dropoffRate}%
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="text-right p-2">
                        {data.cumulativeDropoffRate.toFixed(1)}%
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
