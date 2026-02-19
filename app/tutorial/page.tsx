'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Home, Database } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { parseTutorialCSVData, TutorialEvent } from '@/lib/tutorial-processor';
import { streamParseCSV } from '@/lib/csv-stream-parser';
import { TutorialFunnelAnalysis } from '@/components/tutorial-funnel-analysis';

interface DataFileInfo {
  fileName: string;
  displayName: string;
  startDate: string;
  endDate: string;
  filePath: string;
}

export default function TutorialPage() {
  const router = useRouter();
  const [events, setEvents] = useState<TutorialEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [availableFiles, setAvailableFiles] = useState<DataFileInfo[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');

  // Fetch available tutorial files on mount
  useEffect(() => {
    fetch('/api/tutorial-files')
      .then(res => res.json())
      .then(data => {
        if (data.files && data.files.length > 0) {
          setAvailableFiles(data.files);
        }
      })
      .catch(error => console.error('Error fetching tutorial files:', error));
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsLoading(true);

    try {
      const { rows } = await streamParseCSV(file);
      const parsedEvents = parseTutorialCSVData(rows);
      setEvents(parsedEvents);
    } catch (error) {
      console.error('CSV parsing error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDataFile = async (filePath: string, displayName: string) => {
    setIsLoading(true);

    try {
      const response = await fetch(filePath);
      const csvText = await response.text();
      const { rows } = await streamParseCSV(csvText);
      const parsedEvents = parseTutorialCSVData(rows);
      setEvents(parsedEvents);
      setFileName(displayName);
    } catch (error) {
      console.error('Error loading data file:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">튜토리얼 분석</h1>
          <p className="text-muted-foreground mt-2">
            튜토리얼 스테이지에서 플레이어가 어느 구간에서 이탈하는지 분석합니다
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push('/')}
          className="gap-2"
        >
          <Home className="h-4 w-4" />
          메인으로
        </Button>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>튜토리얼 데이터 선택</CardTitle>
            <CardDescription>
              준비된 튜토리얼 데이터를 선택하거나 CSV 파일을 업로드하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Available Data Files Section */}
            {availableFiles.length > 0 && (
              <>
                <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Database className="w-5 h-5 text-purple-400" />
                    <h3 className="font-semibold">사용 가능한 튜토리얼 데이터</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {availableFiles.length}개의 튜토리얼 데이터 파일이 있습니다
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
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="데이터 기간 선택..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {availableFiles.map((file) => (
                        <SelectItem
                          key={file.filePath}
                          value={file.filePath}
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
                      <div className="w-full border-t"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-background text-muted-foreground">또는</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12">
              <Upload className="h-12 w-12 text-muted-foreground mb-4" />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Button disabled={isLoading}>
                  {isLoading ? '로딩 중...' : 'CSV 파일 선택'}
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <p className="text-sm text-muted-foreground mt-4">
                또는 파일을 드래그 앤 드롭하세요
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <TutorialFunnelAnalysis events={events} />
      )}
    </div>
  );
}
