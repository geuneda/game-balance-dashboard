"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    className?: string;
    glow?: boolean;
    gradient?: "purple" | "cyan" | "pink" | "orange" | "none";
    hover?: boolean;
}

const gradientBorders = {
    purple: "before:from-violet-500/50 before:via-purple-500/50 before:to-fuchsia-500/50",
    cyan: "before:from-cyan-500/50 before:via-teal-500/50 before:to-emerald-500/50",
    pink: "before:from-pink-500/50 before:via-rose-500/50 before:to-red-500/50",
    orange: "before:from-orange-500/50 before:via-amber-500/50 before:to-yellow-500/50",
    none: "",
};

const glowColors = {
    purple: "shadow-[0_0_30px_rgba(139,92,246,0.15)]",
    cyan: "shadow-[0_0_30px_rgba(34,211,238,0.15)]",
    pink: "shadow-[0_0_30px_rgba(244,114,182,0.15)]",
    orange: "shadow-[0_0_30px_rgba(251,146,60,0.15)]",
    none: "",
};

export function GlassCard({
    children,
    className,
    glow = false,
    gradient = "none",
    hover = true,
    ...props
}: GlassCardProps) {
    return (
        <motion.div
            className={cn(
                "relative rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10",
                "before:absolute before:inset-0 before:rounded-2xl before:p-[1px]",
                "before:bg-gradient-to-br before:-z-10",
                gradient !== "none" && gradientBorders[gradient],
                glow && glowColors[gradient],
                hover && "transition-all duration-300 hover:scale-[1.02] hover:border-white/20",
                className,
            )}
            whileHover={hover ? { y: -4 } : undefined}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            {...props}
        >
            {children}
        </motion.div>
    );
}
