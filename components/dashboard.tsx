'use client';

import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { GameEvent, FilterOptions, StageType, ReviveEvent } from '@/types/game-data';
import { parseCSVData, calculateStageStats, findDifficultySpikes, getVoluntaryExitRate, getOverallClearRate, filterEvents, getCountries, calculateStageAttrition, calculateUserAttrition, getUniqueUserCount, calculateUserStageStats, parseReviveEvents, calculateStageReviveStats } from '@/lib/data-processor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FilterX, Database, GraduationCap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import StageOverview from './stage-overview';
import DifficultyCurve from './difficulty-curve';
import FunnelAnalysis from './funnel-analysis';
import StageComparison from './stage-comparison';
import { AttritionAnalysis } from './attrition-analysis';
import { UserAttritionAnalysis } from './user-attrition-analysis';
import { UserStageAnalysis } from './user-stage-analysis';
import { FirstClearAnalysis } from './first-clear-analysis';
import { ReviveAnalysis } from './revive-analysis';
import MetricsCards from './metrics-cards';

interface DataFileInfo {
  fileName: string;
  displayName: string;
  startDate: string;
  endDate: string;
  filePath: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [gameData, setGameData] = useState<GameEvent[]>([]);
  const [reviveData, setReviveData] = useState<ReviveEvent[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [excludeVoluntaryExits, setExcludeVoluntaryExits] = useState(false);
  const [excludeRepeatPlays, setExcludeRepeatPlays] = useState(false);
  const [stageType, setStageType] = useState<StageType>('all');
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [availableFiles, setAvailableFiles] = useState<DataFileInfo[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('');

  // Fetch available data files on mount
  useEffect(() => {
    fetch('/api/data-files')
      .then(res => res.json())
      .then(data => {
        if (data.files && data.files.length > 0) {
          setAvailableFiles(data.files);
        }
      })
      .catch(error => console.error('Error fetching data files:', error));
  }, []);

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
        const reviveEvents = parseReviveEvents(results.data);
        setGameData(events);
        setReviveData(reviveEvents);
        setIsLoading(false);
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        setIsLoading(false);
      }
    });
  };

  const loadDataFile = (filePath: string, displayName: string) => {
    setIsLoading(true);
    fetch(filePath)
      .then(response => response.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const events = parseCSVData(results.data);
            const reviveEvents = parseReviveEvents(results.data);
            setGameData(events);
            setReviveData(reviveEvents);
            setFileName(displayName);
            setIsLoading(false);
          }
        });
      })
      .catch(error => {
        console.error('Error loading data file:', error);
        setIsLoading(false);
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
            const reviveEvents = parseReviveEvents(results.data);
            setGameData(events);
            setReviveData(reviveEvents);
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
            {/* Available Data Files Section */}
            {availableFiles.length > 0 && (
              <>
                <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Database className="w-5 h-5 text-blue-400" />
                    <h3 className="font-semibold text-white">사용 가능한 데이터</h3>
                  </div>
                  <p className="text-sm text-slate-300 mb-3">
                    {availableFiles.length}개의 데이터 파일이 있습니다
                  </p>
                  <Select
                    value={selectedFile}
                    onValueChange={(value) => {
                      setSelectedFile(value);
                      const file = availableFiles.find(f => f.filePath === value);
                      if (file) {
                        loadDataFile(file.filePath, file.displayName);
                      }
                    }}
                  >
                    <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="데이터 기간 선택..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 max-h-[300px]">
                      {availableFiles.map((file) => (
                        <SelectItem
                          key={file.filePath}
                          value={file.filePath}
                          className="text-white hover:bg-slate-700"
                        >
                          📅 {file.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              </>
            )}

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

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={loadSampleData}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
                disabled={isLoading}
              >
                {isLoading ? '로딩 중...' : '샘플 데이터로 시작하기'}
              </Button>

              <Button
                onClick={() => router.push('/tutorial')}
                variant="outline"
                className="border-purple-600 text-purple-300 hover:bg-purple-900/50 hover:border-purple-500"
              >
                <GraduationCap className="w-4 h-4 mr-2" />
                튜토리얼 분석
              </Button>
            </div>

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

  // Get available countries from data
  const availableCountries = getCountries(gameData);

  // Create filter options
  const filterOptions: FilterOptions = {
    excludeVoluntaryExits,
    excludeRepeatPlays,
    stageType,
    selectedCountries
  };

  // Filter data based on all filter options
  const filteredData = filterEvents(gameData, filterOptions);

  const stageStats = calculateStageStats(filteredData);
  const difficultySpikes = findDifficultySpikes(filteredData);
  const overallClearRate = getOverallClearRate(filteredData);
  const voluntaryExitRate = getVoluntaryExitRate(gameData); // Always use full data for this metric
  const attritionData = calculateStageAttrition(stageStats);
  const userAttritionData = calculateUserAttrition(filteredData);
  const uniqueUserCount = getUniqueUserCount(filteredData);
  const userStageStats = calculateUserStageStats(filteredData);
  const reviveStats = calculateStageReviveStats(reviveData);

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
            <CardContent className="py-4 space-y-4">
              <div className="flex items-center gap-3 text-white">
                <FilterX className="w-5 h-5 text-slate-400" />
                <h3 className="font-semibold">필터 설정</h3>
              </div>

              {/* Voluntary Exit Filter */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
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

              {/* Repeat Play Filter */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm font-medium text-white">
                      반복 플레이 데이터 제외
                    </p>
                    <p className="text-xs text-slate-400">
                      is_repeat_play 데이터를 분석에서 제외합니다
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setExcludeRepeatPlays(!excludeRepeatPlays)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    excludeRepeatPlays ? 'bg-blue-600' : 'bg-slate-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      excludeRepeatPlays ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Stage Type Filter */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">
                    스테이지 타입 필터
                  </p>
                  <p className="text-xs text-slate-400">
                    특정 타입의 스테이지만 표시합니다
                  </p>
                </div>
                <Select value={stageType} onValueChange={(value: StageType) => setStageType(value)}>
                  <SelectTrigger className="w-[180px] bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all" className="text-white hover:bg-slate-700">전체 스테이지</SelectItem>
                    <SelectItem value="normal" className="text-white hover:bg-slate-700">일반 (2001-2999)</SelectItem>
                    <SelectItem value="elite" className="text-white hover:bg-slate-700">정예 (3001-3999)</SelectItem>
                    <SelectItem value="luck" className="text-white hover:bg-slate-700">운빨 던전 (4001-4999)</SelectItem>
                    <SelectItem value="mass" className="text-white hover:bg-slate-700">물량 던전 (5001-5999)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Country Filter */}
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-white">
                    국가 필터
                  </p>
                  <p className="text-xs text-slate-400">
                    특정 국가의 데이터만 분석합니다
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableCountries.slice(0, 10).map(country => (
                    <button
                      key={country.code}
                      onClick={() => {
                        if (selectedCountries.includes(country.code)) {
                          setSelectedCountries(selectedCountries.filter(c => c !== country.code));
                        } else {
                          setSelectedCountries([...selectedCountries, country.code]);
                        }
                      }}
                      className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                        selectedCountries.includes(country.code)
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {country.name} ({country.count})
                    </button>
                  ))}
                  {availableCountries.length > 10 && (
                    <Select
                      value=""
                      onValueChange={(code) => {
                        if (!selectedCountries.includes(code)) {
                          setSelectedCountries([...selectedCountries, code]);
                        }
                      }}
                    >
                      <SelectTrigger className="w-[140px] bg-slate-700 border-slate-600 text-white text-xs">
                        <SelectValue placeholder="더 보기..." />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 max-h-[300px]">
                        {availableCountries.slice(10).map(country => (
                          <SelectItem
                            key={country.code}
                            value={country.code}
                            className="text-white hover:bg-slate-700 text-xs"
                          >
                            {country.name} ({country.count})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                {selectedCountries.length > 0 && (
                  <button
                    onClick={() => setSelectedCountries([])}
                    className="text-xs text-blue-400 hover:text-blue-300 underline"
                  >
                    모든 국가 선택 해제
                  </button>
                )}
              </div>

              {/* Filter Status Message */}
              {(excludeVoluntaryExits || excludeRepeatPlays || stageType !== 'all' || selectedCountries.length > 0) && (
                <div className="mt-3 p-2 bg-blue-900/30 border border-blue-700/50 rounded text-xs text-blue-300">
                  <div className="space-y-1">
                    <p>ⓘ 필터 적용 중:</p>
                    {excludeVoluntaryExits && (
                      <p>• 자발적 포기: {gameData.filter(e => e.eventAction === 'fail' && e.customEventProperties.exit_type === 'voluntary_exit').length}개 제외</p>
                    )}
                    {excludeRepeatPlays && (
                      <p>• 반복 플레이: {gameData.filter(e => e.customEventProperties.is_repeat_play === true).length}개 제외</p>
                    )}
                    {stageType !== 'all' && (
                      <p>• 스테이지 타입: {stageType === 'normal' ? '일반' : stageType === 'elite' ? '정예' : stageType === 'luck' ? '운빨 던전' : '물량 던전'}만 표시</p>
                    )}
                    {selectedCountries.length > 0 && (
                      <p>• 국가: {selectedCountries.map(code => availableCountries.find(c => c.code === code)?.name || code).join(', ')} ({selectedCountries.length}개 국가)</p>
                    )}
                  </div>
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
          uniqueUserCount={uniqueUserCount}
        />

        {/* Main Content */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-9 bg-slate-800 border border-slate-700">
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
              value="attrition"
              className="text-slate-300 data-[state=active]:bg-slate-700 data-[state=active]:text-white"
            >
              이탈 분석
            </TabsTrigger>
            <TabsTrigger
              value="user-attrition"
              className="text-slate-300 data-[state=active]:bg-slate-700 data-[state=active]:text-white"
            >
              사용자 이탈
            </TabsTrigger>
            <TabsTrigger
              value="user-stage"
              className="text-slate-300 data-[state=active]:bg-slate-700 data-[state=active]:text-white"
            >
              사용자 스테이지
            </TabsTrigger>
            <TabsTrigger
              value="revive"
              className="text-slate-300 data-[state=active]:bg-slate-700 data-[state=active]:text-white"
            >
              부활 분석
            </TabsTrigger>
            <TabsTrigger
              value="first-clear"
              className="text-slate-300 data-[state=active]:bg-slate-700 data-[state=active]:text-white"
            >
              첫 클리어
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
            <FunnelAnalysis events={filteredData} />
          </TabsContent>

          <TabsContent value="attrition" className="space-y-4">
            <AttritionAnalysis data={attritionData} />
          </TabsContent>

          <TabsContent value="user-attrition" className="space-y-4">
            <UserAttritionAnalysis data={userAttritionData} />
          </TabsContent>

          <TabsContent value="user-stage" className="space-y-4">
            <UserStageAnalysis data={userStageStats} reviveStats={reviveStats} />
          </TabsContent>

          <TabsContent value="revive" className="space-y-4">
            <ReviveAnalysis data={reviveStats} />
          </TabsContent>

          <TabsContent value="first-clear" className="space-y-4">
            <FirstClearAnalysis events={filteredData} />
          </TabsContent>

          <TabsContent value="comparison" className="space-y-4">
            <StageComparison stageStats={stageStats} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
