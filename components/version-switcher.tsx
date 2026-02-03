"use client";

import { motion } from "framer-motion";

interface VersionSwitcherProps {
    currentVersion: "v1" | "v2";
    onVersionChange: (version: "v1" | "v2") => void;
}

export function VersionSwitcher({
    currentVersion,
    onVersionChange,
}: VersionSwitcherProps) {
    return (
        <div className="relative flex items-center bg-slate-800/80 backdrop-blur-sm rounded-full p-1 border border-slate-700">
            <motion.div
                className="absolute h-[calc(100%-8px)] w-[calc(50%-4px)] bg-gradient-to-r from-violet-600 to-purple-600 rounded-full"
                animate={{
                    x: currentVersion === "v1" ? 4 : "calc(100% + 4px)",
                }}
                transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                }}
            />
            <button
                onClick={() => onVersionChange("v1")}
                className={`relative z-10 px-4 py-1.5 text-sm font-medium transition-colors ${
                    currentVersion === "v1"
                        ? "text-white"
                        : "text-slate-400 hover:text-slate-200"
                }`}
            >
                v1
            </button>
            <button
                onClick={() => onVersionChange("v2")}
                className={`relative z-10 px-4 py-1.5 text-sm font-medium transition-colors ${
                    currentVersion === "v2"
                        ? "text-white"
                        : "text-slate-400 hover:text-slate-200"
                }`}
            >
                v2
            </button>
        </div>
    );
}
