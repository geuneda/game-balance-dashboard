'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import { GameEvent } from '@/types/game-data';
import { parseCSVData, calculateStageStats, findDifficultySpikes, calculateFunnelData, getVoluntaryExitRate, getOverallClearRate } from '@/lib/data-processor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FilterX } from 'lucide-react';
import StageOverview from './stage-overview';
import DifficultyCurve from './difficulty-curve';
import FunnelAnalysis from './funnel-analysis';
import StageComparison from './stage-comparison';
import MetricsCards from './metrics-cards';

export default function Dashboard() {
  const [gameData, setGameData] = useState<GameEvent[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [excludeVoluntaryExits, setExcludeVoluntaryExits] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsLoading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const events = parseCSVData(results.data);
        setGameData(events);
        setIsLoading(false);
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        setIsLoading(false);
      }
    });
  };

  const loadSampleData = () => {
    setIsLoading(true);
    fetch('/sample_data.csv')
      .then(response => response.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const events = parseCSVData(results.data);
            setGameData(events);
            setFileName('sample_data.csv');
            setIsLoading(false);
          }
        });
      });
  };

  if (gameData.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-white">
              🎮 게임 밸런스 분석 대시보드
            </CardTitle>
            <CardDescription className="text-center text-slate-300">
              CSV 파일을 업로드하여 게임 밸런스 데이터를 시각화하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-600 rounded-lg p-12 hover:border-slate-500 transition-colors">
              <Upload className="w-16 h-16 text-slate-400 mb-4" />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Button variant="default" className="bg-blue-600 hover:bg-blue-700" asChild>
                  <span>CSV 파일 선택</span>
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <p className="text-sm text-slate-400 mt-4">
                또는 파일을 드래그 앤 드롭하세요
              </p>
            </div>

            <div className="text-center">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-slate-800/50 text-slate-400">또는</span>
                </div>
              </div>
            </div>

            <Button
              onClick={loadSampleData}
              variant="outline"
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
              disabled={isLoading}
            >
              {isLoading ? '로딩 중...' : '샘플 데이터로 시작하기'}
            </Button>

            <div className="bg-slate-700/30 rounded-lg p-4 mt-6">
              <h3 className="font-semibold text-white mb-2">📊 분석 기능</h3>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• 스테이지별 클리어율 및 실패율 분석</li>
                <li>• 난이도 곡선 및 스파이크 탐지</li>
                <li>• 레벨별 플레이어 이탈 퍼널 분석</li>
                <li>• 자발적 포기율 및 평균 실패 레벨 추적</li>
                <li>• 스테이지 간 비교 분석</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filter data based on voluntary exit exclusion
  const filteredData = excludeVoluntaryExits
    ? gameData.filter(event => !(event.eventAction === 'fail' && event.customEventProperties.exit_type === 'voluntary_exit'))
    : gameData;

  const stageStats = calculateStageStats(filteredData);
  const difficultySpikes = findDifficultySpikes(filteredData);
  const funnelData = calculateFunnelData(filteredData);
  const overallClearRate = getOverallClearRate(filteredData);
  const voluntaryExitRate = getVoluntaryExitRate(gameData); // Always use full data for this metric

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                🎮 게임 밸런스 분석
              </h1>
              <p className="text-slate-400">
                파일: <span className="text-slate-300 font-medium">{fileName}</span>
              </p>
            </div>
            <label htmlFor="file-upload-header" className="cursor-pointer">
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700" asChild>
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  다른 파일 업로드
                </span>
              </Button>
              <input
                id="file-upload-header"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Filter Toggle */}
          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FilterX className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-white">
                      자발적 포기 데이터 제외
                    </p>
                    <p className="text-xs text-slate-400">
                      voluntary_exit 데이터를 분석에서 제외합니다
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setExcludeVoluntaryExits(!excludeVoluntaryExits)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    excludeVoluntaryExits ? 'bg-blue-600' : 'bg-slate-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      excludeVoluntaryExits ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              {excludeVoluntaryExits && (
                <div className="mt-3 p-2 bg-blue-900/30 border border-blue-700/50 rounded text-xs text-blue-300">
                  ⓘ 현재 {gameData.filter(e => e.eventAction === 'fail' && e.customEventProperties.exit_type === 'voluntary_exit').length}개의 자발적 포기 데이터가 제외되어 있습니다.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Metrics Cards */}
        <MetricsCards
          totalEvents={filteredData.length}
          overallClearRate={overallClearRate}
          voluntaryExitRate={voluntaryExitRate}
          totalStages={stageStats.length}
        />

        {/* Main Content */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800 border border-slate-700">
            <TabsTrigger
              value="overview"
              className="text-slate-300 data-[state=active]:bg-slate-700 data-[state=active]:text-white"
            >
              개요
            </TabsTrigger>
            <TabsTrigger
              value="difficulty"
              className="text-slate-300 data-[state=active]:bg-slate-700 data-[state=active]:text-white"
            >
              난이도 분석
            </TabsTrigger>
            <TabsTrigger
              value="funnel"
              className="text-slate-300 data-[state=active]:bg-slate-700 data-[state=active]:text-white"
            >
              퍼널 분석
            </TabsTrigger>
            <TabsTrigger
              value="comparison"
              className="text-slate-300 data-[state=active]:bg-slate-700 data-[state=active]:text-white"
            >
              스테이지 비교
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <StageOverview stageStats={stageStats} />
          </TabsContent>

          <TabsContent value="difficulty" className="space-y-4">
            <DifficultyCurve difficultySpikes={difficultySpikes} />
          </TabsContent>

          <TabsContent value="funnel" className="space-y-4">
            <FunnelAnalysis funnelData={funnelData} />
          </TabsContent>

          <TabsContent value="comparison" className="space-y-4">
            <StageComparison stageStats={stageStats} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
