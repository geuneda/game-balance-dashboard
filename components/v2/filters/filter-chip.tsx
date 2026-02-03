"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterChipProps {
    label: string;
    active?: boolean;
    onToggle?: () => void;
    onRemove?: () => void;
    variant?: "toggle" | "removable";
    size?: "sm" | "md";
}

export function FilterChip({
    label,
    active = false,
    onToggle,
    onRemove,
    variant = "toggle",
    size = "md",
}: FilterChipProps) {
    const sizeClasses = {
        sm: "px-2.5 py-1 text-xs",
        md: "px-3 py-1.5 text-sm",
    };

    if (variant === "removable") {
        return (
            <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={onRemove}
                className={cn(
                    "flex items-center gap-1.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30",
                    sizeClasses[size],
                    "hover:bg-violet-500/30 transition-colors",
                )}
            >
                {label}
                <X className="w-3 h-3" />
            </motion.button>
        );
    }

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggle}
            className={cn(
                "rounded-full border transition-all duration-200",
                sizeClasses[size],
                active
                    ? "bg-violet-500/20 text-violet-300 border-violet-500/50 shadow-[0_0_10px_rgba(139,92,246,0.2)]"
                    : "bg-slate-800/50 text-slate-400 border-slate-700 hover:border-slate-600 hover:text-slate-300",
            )}
        >
            {label}
        </motion.button>
    );
}
