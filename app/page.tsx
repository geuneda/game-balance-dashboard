"use client";

import { useState, useEffect } from "react";
import Dashboard from "@/components/dashboard";
import { DashboardV2 } from "@/components/v2/dashboard-v2";
import { DropzoneV2 } from "@/components/v2/upload/dropzone";
import { GameEvent, ReviveEvent } from "@/types/game-data";
import { parseCSVData, parseReviveEvents } from "@/lib/data-processor";
import { streamParseCSV } from "@/lib/csv-stream-parser";

interface DataFileInfo {
    fileName: string;
    displayName: string;
    startDate: string;
    endDate: string;
    filePath: string;
    uploadedAt?: string;
    isBlob?: boolean;
}

export default function Home() {
    const [version, setVersion] = useState<"v1" | "v2">("v1");
    const [gameData, setGameData] = useState<GameEvent[]>([]);
    const [reviveData, setReviveData] = useState<ReviveEvent[]>([]);
    const [fileName, setFileName] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [availableFiles, setAvailableFiles] = useState<DataFileInfo[]>([]);

    // Load version preference from localStorage
    useEffect(() => {
        const savedVersion = localStorage.getItem("dashboard-version");
        if (savedVersion === "v1" || savedVersion === "v2") {
            setVersion(savedVersion);
        }
    }, []);

    // Save version preference
    const handleVersionChange = (newVersion: "v1" | "v2") => {
        setVersion(newVersion);
        localStorage.setItem("dashboard-version", newVersion);
    };

    // Fetch available data files
    const fetchDataFiles = () => {
        fetch("/api/data-files")
            .then((res) => res.json())
            .then((data) => {
                if (data.files) {
                    setAvailableFiles(data.files);
                }
            })
            .catch((error) => console.error("Error fetching data files:", error));
    };

    useEffect(() => {
        fetchDataFiles();
    }, []);

    // Parse CSV file (streaming for large files)
    const parseFile = async (file: File) => {
        setFileName(file.name);
        setIsLoading(true);
        setProgress(0);

        try {
            const { rows } = await streamParseCSV(file, {
                onProgress: setProgress,
            });
            const events = parseCSVData(rows);
            const reviveEvents = parseReviveEvents(rows);
            setGameData(events);
            setReviveData(reviveEvents);
        } catch (error) {
            console.error("Error parsing CSV:", error);
        } finally {
            setIsLoading(false);
            setProgress(0);
        }
    };

    // Load data file from path
    const loadDataFile = async (filePath: string, displayName: string) => {
        setIsLoading(true);
        setProgress(0);

        try {
            const response = await fetch(filePath);
            const csvText = await response.text();
            const { rows } = await streamParseCSV(csvText);
            const events = parseCSVData(rows);
            const reviveEvents = parseReviveEvents(rows);
            setGameData(events);
            setReviveData(reviveEvents);
            setFileName(displayName);
        } catch (error) {
            console.error("Error loading data file:", error);
        } finally {
            setIsLoading(false);
            setProgress(0);
        }
    };

    // Load sample data
    const loadSampleData = async () => {
        setIsLoading(true);
        setProgress(0);

        try {
            const response = await fetch("/sample_data.csv");
            const csvText = await response.text();
            const { rows } = await streamParseCSV(csvText);
            const events = parseCSVData(rows);
            const reviveEvents = parseReviveEvents(rows);
            setGameData(events);
            setReviveData(reviveEvents);
            setFileName("sample_data.csv");
        } catch (error) {
            console.error("Error loading sample data:", error);
        } finally {
            setIsLoading(false);
            setProgress(0);
        }
    };

    // Delete file handler
    const handleDeleteFile = async (file: DataFileInfo) => {
        if (!confirm(`"${file.fileName}" 파일을 삭제하시겠습니까?`)) return;

        try {
            const params = new URLSearchParams();
            if (file.isBlob) {
                params.set("blobUrl", file.filePath);
            } else {
                params.set("fileName", file.fileName);
            }

            const response = await fetch(`/api/data-files?${params.toString()}`, {
                method: "DELETE",
            });

            if (response.ok) {
                fetchDataFiles();
            } else {
                const result = await response.json();
                alert(result.error || "삭제 실패");
            }
        } catch (error) {
            console.error("Delete error:", error);
            alert("삭제 중 오류가 발생했습니다");
        }
    };

    // File upload handler for header
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            parseFile(file);
        }
    };

    // No data loaded - show upload screen with version switcher
    if (gameData.length === 0) {
        if (version === "v2") {
            return (
                <div className="relative">
                    <FloatingVersionSwitcher
                        version={version}
                        onVersionChange={handleVersionChange}
                    />
                    <DropzoneV2
                        onFileSelect={parseFile}
                        onLoadSample={loadSampleData}
                        isLoading={isLoading}
                        progress={progress}
                        availableFiles={availableFiles}
                        onSelectFile={(file) => loadDataFile(file.filePath, file.displayName)}
                        onDeleteFile={handleDeleteFile}
                    />
                </div>
            );
        }
        // V1 uses its own upload screen inside Dashboard component
        return (
            <div className="relative">
                <FloatingVersionSwitcher
                    version={version}
                    onVersionChange={handleVersionChange}
                />
                <Dashboard />
            </div>
        );
    }

    // Data loaded - show dashboard
    if (version === "v2") {
        return (
            <DashboardV2
                gameData={gameData}
                reviveData={reviveData}
                fileName={fileName}
                onFileUpload={handleFileUpload}
                version={version}
                onVersionChange={handleVersionChange}
            />
        );
    }

    // V1 Dashboard with version switcher injected
    return (
        <DashboardWithVersionSwitcher
            version={version}
            onVersionChange={handleVersionChange}
        />
    );
}

// Floating version switcher component
function FloatingVersionSwitcher({
    version,
    onVersionChange,
}: {
    version: "v1" | "v2";
    onVersionChange: (v: "v1" | "v2") => void;
}) {
    return (
        <div className="fixed top-4 right-4 z-50">
            <div className="flex items-center bg-slate-800/90 backdrop-blur-sm rounded-full p-1 border border-slate-700 shadow-lg">
                <button
                    onClick={() => onVersionChange("v1")}
                    className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                        version === "v1"
                            ? "bg-blue-600 text-white"
                            : "text-slate-400 hover:text-white"
                    }`}
                >
                    v1
                </button>
                <button
                    onClick={() => onVersionChange("v2")}
                    className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                        version === "v2"
                            ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white"
                            : "text-slate-400 hover:text-white"
                    }`}
                >
                    v2
                </button>
            </div>
        </div>
    );
}

// Wrapper component to inject version switcher into v1 Dashboard
function DashboardWithVersionSwitcher({
    version,
    onVersionChange,
}: {
    version: "v1" | "v2";
    onVersionChange: (v: "v1" | "v2") => void;
}) {
    return (
        <div className="relative">
            <FloatingVersionSwitcher version={version} onVersionChange={onVersionChange} />
            <Dashboard />
        </div>
    );
}
