"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRef, useState, useEffect } from "react";

interface Tab {
    id: string;
    label: string;
    icon?: React.ReactNode;
}

interface TabNavigatorV2Props {
    tabs: Tab[];
    activeTab: string;
    onTabChange: (id: string) => void;
    className?: string;
}

export function TabNavigatorV2({
    tabs,
    activeTab,
    onTabChange,
    className,
}: TabNavigatorV2Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const activeButton = container.querySelector(
            `[data-tab-id="${activeTab}"]`,
        ) as HTMLButtonElement;
        if (activeButton) {
            setIndicatorStyle({
                left: activeButton.offsetLeft,
                width: activeButton.offsetWidth,
            });
        }
    }, [activeTab]);

    return (
        <div
            className={cn(
                "relative bg-slate-900/60 backdrop-blur-xl rounded-2xl p-2 border border-white/10",
                className,
            )}
        >
            <div
                ref={containerRef}
                className="relative flex items-center gap-1 overflow-x-auto scrollbar-hide"
            >
                <motion.div
                    className="absolute h-[calc(100%-8px)] bg-gradient-to-r from-violet-600/80 to-purple-600/80 rounded-xl"
                    animate={{
                        left: indicatorStyle.left,
                        width: indicatorStyle.width,
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                    }}
                    style={{
                        top: 4,
                        boxShadow: "0 0 20px rgba(139, 92, 246, 0.4)",
                    }}
                />
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        data-tab-id={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={cn(
                            "relative z-10 flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-colors whitespace-nowrap",
                            activeTab === tab.id
                                ? "text-white"
                                : "text-slate-400 hover:text-slate-200",
                        )}
                    >
                        {tab.icon && (
                            <span
                                className={cn(
                                    "transition-transform",
                                    activeTab === tab.id && "scale-110",
                                )}
                            >
                                {tab.icon}
                            </span>
                        )}
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
