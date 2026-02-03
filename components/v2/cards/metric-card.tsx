"use client";

import { motion } from "framer-motion";
import { GlassCard } from "./glass-card";
import { NumberTicker } from "../animations/number-ticker";
import { cn } from "@/lib/utils";

interface MetricCardProps {
    title: string;
    value: number;
    suffix?: string;
    prefix?: string;
    decimals?: number;
    subtitle?: string;
    icon: React.ReactNode;
    gradient: "purple" | "cyan" | "pink" | "orange";
    delay?: number;
}

const iconBgColors = {
    purple: "bg-violet-500/20 text-violet-400",
    cyan: "bg-cyan-500/20 text-cyan-400",
    pink: "bg-pink-500/20 text-pink-400",
    orange: "bg-orange-500/20 text-orange-400",
};

const valueColors = {
    purple: "from-violet-400 to-purple-400",
    cyan: "from-cyan-400 to-teal-400",
    pink: "from-pink-400 to-rose-400",
    orange: "from-orange-400 to-amber-400",
};

export function MetricCard({
    title,
    value,
    suffix = "",
    prefix = "",
    decimals = 0,
    subtitle,
    icon,
    gradient,
    delay = 0,
}: MetricCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
        >
            <GlassCard
                gradient={gradient}
                glow
                className="p-5 h-full"
            >
                <div className="flex items-start justify-between mb-3">
                    <div
                        className={cn(
                            "p-2.5 rounded-xl",
                            iconBgColors[gradient],
                        )}
                    >
                        {icon}
                    </div>
                </div>

                <div className="space-y-1">
                    <p className="text-sm text-slate-400 font-medium">{title}</p>
                    <p
                        className={cn(
                            "text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
                            valueColors[gradient],
                        )}
                    >
                        <NumberTicker
                            value={value}
                            decimals={decimals}
                            suffix={suffix}
                            prefix={prefix}
                            duration={1500}
                        />
                    </p>
                    {subtitle && (
                        <p className="text-xs text-slate-500">{subtitle}</p>
                    )}
                </div>
            </GlassCard>
        </motion.div>
    );
}
