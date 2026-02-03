"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Filter, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { FilterChip } from "./filter-chip";
import { GlassCard } from "../cards/glass-card";
import {
    FilterOptions,
    StageType,
} from "@/types/game-data";

interface Country {
    code: string;
    name: string;
    count: number;
}

interface FilterPanelV2Props {
    filters: FilterOptions;
    onChange: (filters: FilterOptions) => void;
    availableCountries: Country[];
    isExpanded: boolean;
    onToggle: () => void;
}

const stageTypes: { value: StageType; label: string }[] = [
    { value: "all", label: "전체" },
    { value: "normal", label: "일반" },
    { value: "elite", label: "정예" },
    { value: "luck", label: "운빨" },
    { value: "mass", label: "물량" },
];

export function FilterPanelV2({
    filters,
    onChange,
    availableCountries,
    isExpanded,
    onToggle,
}: FilterPanelV2Props) {
    const activeFilterCount = [
        filters.excludeVoluntaryExitsLowLevel,
        filters.excludeVoluntaryExitsHighLevel,
        filters.excludeRepeatPlays,
        filters.stageType !== "all",
        filters.selectedCountries.length > 0,
    ].filter(Boolean).length;

    const handleReset = () => {
        onChange({
            excludeVoluntaryExitsLowLevel: false,
            excludeVoluntaryExitsHighLevel: false,
            excludeRepeatPlays: false,
            stageType: "all",
            selectedCountries: [],
        });
    };

    return (
        <GlassCard gradient="none" hover={false} className="overflow-hidden">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-violet-500/20 text-violet-400">
                        <Filter className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-white">필터 설정</span>
                    {activeFilterCount > 0 && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-violet-500/30 text-violet-300">
                            {activeFilterCount}
                        </span>
                    )}
                </div>
                <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                </motion.div>
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 pt-0 space-y-6">
                            <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

                            {/* Voluntary Exit Filters */}
                            <div className="space-y-3">
                                <p className="text-sm text-slate-400 font-medium">
                                    자발적 포기 제외
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <FilterChip
                                        label="저레벨 (0-9)"
                                        active={filters.excludeVoluntaryExitsLowLevel}
                                        onToggle={() =>
                                            onChange({
                                                ...filters,
                                                excludeVoluntaryExitsLowLevel:
                                                    !filters.excludeVoluntaryExitsLowLevel,
                                            })
                                        }
                                    />
                                    <FilterChip
                                        label="고레벨 (10+)"
                                        active={filters.excludeVoluntaryExitsHighLevel}
                                        onToggle={() =>
                                            onChange({
                                                ...filters,
                                                excludeVoluntaryExitsHighLevel:
                                                    !filters.excludeVoluntaryExitsHighLevel,
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            {/* Repeat Play Filter */}
                            <div className="space-y-3">
                                <p className="text-sm text-slate-400 font-medium">
                                    반복 플레이
                                </p>
                                <FilterChip
                                    label="반복 플레이 제외"
                                    active={filters.excludeRepeatPlays}
                                    onToggle={() =>
                                        onChange({
                                            ...filters,
                                            excludeRepeatPlays: !filters.excludeRepeatPlays,
                                        })
                                    }
                                />
                            </div>

                            {/* Stage Type Filter */}
                            <div className="space-y-3">
                                <p className="text-sm text-slate-400 font-medium">
                                    스테이지 타입
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {stageTypes.map((type) => (
                                        <FilterChip
                                            key={type.value}
                                            label={type.label}
                                            active={filters.stageType === type.value}
                                            onToggle={() =>
                                                onChange({
                                                    ...filters,
                                                    stageType: type.value,
                                                })
                                            }
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Country Filter */}
                            {availableCountries.length > 0 && (
                                <div className="space-y-3">
                                    <p className="text-sm text-slate-400 font-medium">
                                        국가 필터
                                    </p>
                                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                                        {availableCountries.slice(0, 15).map((country) => (
                                            <FilterChip
                                                key={country.code}
                                                label={`${country.name} (${country.count})`}
                                                size="sm"
                                                active={filters.selectedCountries.includes(
                                                    country.code,
                                                )}
                                                onToggle={() => {
                                                    const newCountries =
                                                        filters.selectedCountries.includes(
                                                            country.code,
                                                        )
                                                            ? filters.selectedCountries.filter(
                                                                  (c) => c !== country.code,
                                                              )
                                                            : [
                                                                  ...filters.selectedCountries,
                                                                  country.code,
                                                              ];
                                                    onChange({
                                                        ...filters,
                                                        selectedCountries: newCountries,
                                                    });
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Reset Button */}
                            {activeFilterCount > 0 && (
                                <motion.button
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    onClick={handleReset}
                                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    필터 초기화
                                </motion.button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </GlassCard>
    );
}
