"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileSpreadsheet, Sparkles, Database, Loader2, Trash2 } from "lucide-react";
import { GlassCard } from "../cards/glass-card";

interface DataFileInfo {
    fileName: string;
    displayName: string;
    startDate: string;
    endDate: string;
    filePath: string;
    uploadedAt?: string;
    isBlob?: boolean;
}

interface DropzoneV2Props {
    onFileSelect: (file: File) => void;
    onLoadSample: () => void;
    isLoading: boolean;
    progress?: number;
    availableFiles: DataFileInfo[];
    onSelectFile: (file: DataFileInfo) => void;
    onDeleteFile: (file: DataFileInfo) => void;
}

export function DropzoneV2({
    onFileSelect,
    onLoadSample,
    isLoading,
    progress = 0,
    availableFiles,
    onSelectFile,
    onDeleteFile,
}: DropzoneV2Props) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDragIn = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragOut = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);

            const files = e.dataTransfer.files;
            if (files && files.length > 0) {
                const file = files[0];
                if (file.name.endsWith(".csv")) {
                    onFileSelect(file);
                }
            }
        },
        [onFileSelect],
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
            {/* Background effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[128px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[128px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative w-full max-w-2xl"
            >
                <GlassCard gradient="purple" glow hover={false} className="p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", delay: 0.2 }}
                            className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 mb-4"
                        >
                            <Sparkles className="w-8 h-8 text-violet-400" />
                        </motion.div>
                        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-2">
                            Game Balance Dashboard
                        </h1>
                        <p className="text-slate-400">
                            CSV 파일을 업로드하여 게임 밸런스를 분석하세요
                        </p>
                    </div>

                    {/* Saved Files */}
                    {availableFiles.length > 0 && (
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <Database className="w-4 h-4 text-cyan-400" />
                                <span className="text-sm text-slate-300 font-medium">
                                    저장된 데이터 ({availableFiles.length})
                                </span>
                            </div>
                            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-2">
                                {availableFiles.map((file) => (
                                    <motion.div
                                        key={file.filePath}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="group flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-violet-500/30 hover:bg-slate-800/80 transition-all cursor-pointer"
                                        onClick={() => onSelectFile(file)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <FileSpreadsheet className="w-5 h-5 text-slate-400" />
                                            <div>
                                                <p className="text-sm font-medium text-white">
                                                    {file.displayName}
                                                </p>
                                                <p className="text-xs text-slate-500 truncate max-w-[250px]">
                                                    {file.fileName}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteFile(file);
                                            }}
                                            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Divider */}
                    {availableFiles.length > 0 && (
                        <div className="flex items-center gap-4 my-6">
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
                            <span className="text-xs text-slate-500">또는</span>
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
                        </div>
                    )}

                    {/* Dropzone */}
                    <motion.div
                        onDragEnter={handleDragIn}
                        onDragLeave={handleDragOut}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        animate={{
                            borderColor: isDragging
                                ? "rgba(139, 92, 246, 0.5)"
                                : "rgba(100, 116, 139, 0.3)",
                            backgroundColor: isDragging
                                ? "rgba(139, 92, 246, 0.1)"
                                : "transparent",
                        }}
                        className="relative border-2 border-dashed rounded-2xl p-8 text-center transition-colors"
                    >
                        <AnimatePresence mode="wait">
                            {isLoading ? (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col items-center w-full max-w-xs"
                                >
                                    <Loader2 className="w-12 h-12 text-violet-400 animate-spin mb-4" />
                                    {progress > 0 ? (
                                        <>
                                            <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
                                                <motion.div
                                                    className="bg-gradient-to-r from-violet-500 to-purple-500 h-2 rounded-full"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${progress}%` }}
                                                    transition={{ duration: 0.3 }}
                                                />
                                            </div>
                                            <p className="text-slate-300 text-sm">
                                                처리 중... {progress}%
                                            </p>
                                        </>
                                    ) : (
                                        <p className="text-slate-300">데이터 로딩 중...</p>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="upload"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col items-center"
                                >
                                    <div className="p-4 rounded-full bg-slate-800/80 mb-4">
                                        <Upload className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <label className="cursor-pointer">
                                        <motion.span
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium shadow-lg shadow-violet-500/25"
                                        >
                                            CSV 파일 선택
                                        </motion.span>
                                        <input
                                            type="file"
                                            accept=".csv"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) onFileSelect(file);
                                            }}
                                            className="hidden"
                                        />
                                    </label>
                                    <p className="text-sm text-slate-500 mt-4">
                                        또는 파일을 드래그 앤 드롭하세요
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Sample Data Button */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={onLoadSample}
                            disabled={isLoading}
                            className="text-sm text-violet-400 hover:text-violet-300 underline underline-offset-4 transition-colors disabled:opacity-50"
                        >
                            샘플 데이터로 시작하기
                        </button>
                    </div>

                    {/* Features */}
                    <div className="mt-8 grid grid-cols-2 gap-3">
                        {[
                            "스테이지 클리어율 분석",
                            "난이도 곡선 시각화",
                            "플레이어 이탈 퍼널",
                            "스테이지 비교",
                        ].map((feature, i) => (
                            <motion.div
                                key={feature}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + i * 0.1 }}
                                className="flex items-center gap-2 text-sm text-slate-400"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                                {feature}
                            </motion.div>
                        ))}
                    </div>
                </GlassCard>
            </motion.div>
        </div>
    );
}
