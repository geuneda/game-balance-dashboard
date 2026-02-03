"use client";

import { motion } from "framer-motion";
import { Upload, Gamepad2 } from "lucide-react";
import { VersionSwitcher } from "@/components/version-switcher";

interface HeaderV2Props {
    fileName?: string;
    onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    version: "v1" | "v2";
    onVersionChange: (v: "v1" | "v2") => void;
}

export function HeaderV2({
    fileName,
    onUpload,
    version,
    onVersionChange,
}: HeaderV2Props) {
    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="sticky top-0 z-50 w-full"
        >
            <div className="bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="flex items-center justify-between h-16 md:h-20">
                        {/* Logo */}
                        <motion.div
                            className="flex items-center gap-3"
                            whileHover={{ scale: 1.02 }}
                        >
                            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30">
                                <Gamepad2 className="w-6 h-6 text-violet-400" />
                            </div>
                            <div>
                                <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                                    Game Balance
                                </h1>
                                {fileName && (
                                    <p className="text-xs text-slate-500 truncate max-w-[150px] md:max-w-none">
                                        {fileName}
                                    </p>
                                )}
                            </div>
                        </motion.div>

                        {/* Right Side */}
                        <div className="flex items-center gap-3">
                            <VersionSwitcher
                                currentVersion={version}
                                onVersionChange={onVersionChange}
                            />
                            <label className="cursor-pointer">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-medium shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-shadow"
                                >
                                    <Upload className="w-4 h-4" />
                                    <span className="hidden sm:inline">업로드</span>
                                </motion.div>
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={onUpload}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>
                </div>
                {/* Gradient border */}
                <div className="h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
            </div>
        </motion.header>
    );
}
