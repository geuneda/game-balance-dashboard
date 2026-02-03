"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutGrid,
    TrendingUp,
    GitBranch,
    Users,
    UserMinus,
    Gamepad2,
    Heart,
    Trophy,
    BarChart3,
} from "lucide-react";

import {
    GameEvent,
    FilterOptions,
    StageType,
    ReviveEvent,
} from "@/types/game-data";
import {
    calculateStageStats,
    findDifficultySpikes,
    getVoluntaryExitRate,
    getOverallClearRate,
    filterEvents,
    getCountries,
    calculateStageAttrition,
    calculateUserAttrition,
    getUniqueUserCount,
    calculateUserStageStats,
    calculateStageReviveStats,
} from "@/lib/data-processor";

import { HeaderV2 } from "./layout/header";
import { BentoGrid } from "./layout/bento-grid";
import { MetricCard } from "./cards/metric-card";
import { TabNavigatorV2 } from "./tabs/tab-navigator";
import { FilterPanelV2 } from "./filters/filter-panel";
import { OverviewV2 } from "./analysis/overview-v2";
import { DifficultyV2 } from "./analysis/difficulty-v2";
import { FunnelV2 } from "./analysis/funnel-v2";
import { AttritionV2 } from "./analysis/attrition-v2";
import { UserAttritionV2 } from "./analysis/user-attrition-v2";
import { UserStageV2 } from "./analysis/user-stage-v2";
import { ReviveV2 } from "./analysis/revive-v2";
import { FirstClearV2 } from "./analysis/first-clear-v2";
import { ComparisonV2 } from "./analysis/comparison-v2";

interface DashboardV2Props {
    gameData: GameEvent[];
    reviveData: ReviveEvent[];
    fileName: string;
    onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    version: "v1" | "v2";
    onVersionChange: (version: "v1" | "v2") => void;
}

const tabs = [
    { id: "overview", label: "개요", icon: <LayoutGrid className="w-4 h-4" /> },
    { id: "difficulty", label: "난이도", icon: <TrendingUp className="w-4 h-4" /> },
    { id: "funnel", label: "퍼널", icon: <GitBranch className="w-4 h-4" /> },
    { id: "attrition", label: "이탈", icon: <UserMinus className="w-4 h-4" /> },
    { id: "user-attrition", label: "사용자 이탈", icon: <Users className="w-4 h-4" /> },
    { id: "user-stage", label: "사용자 스테이지", icon: <Gamepad2 className="w-4 h-4" /> },
    { id: "revive", label: "부활", icon: <Heart className="w-4 h-4" /> },
    { id: "first-clear", label: "첫 클리어", icon: <Trophy className="w-4 h-4" /> },
    { id: "comparison", label: "비교", icon: <BarChart3 className="w-4 h-4" /> },
];

export function DashboardV2({
    gameData,
    reviveData,
    fileName,
    onFileUpload,
    version,
    onVersionChange,
}: DashboardV2Props) {
    const [activeTab, setActiveTab] = useState("overview");
    const [isFilterExpanded, setIsFilterExpanded] = useState(false);
    const [filters, setFilters] = useState<FilterOptions>({
        excludeVoluntaryExitsLowLevel: false,
        excludeVoluntaryExitsHighLevel: false,
        excludeRepeatPlays: false,
        stageType: "all" as StageType,
        selectedCountries: [],
    });

    // Get available countries
    const availableCountries = getCountries(gameData);

    // Filter data
    const filteredData = filterEvents(gameData, filters);

    // Calculate all stats
    const stageStats = calculateStageStats(filteredData);
    const difficultySpikes = findDifficultySpikes(filteredData);
    const overallClearRate = getOverallClearRate(filteredData);
    const voluntaryExitRate = getVoluntaryExitRate(gameData);
    const attritionData = calculateStageAttrition(stageStats);
    const userAttritionData = calculateUserAttrition(filteredData);
    const uniqueUserCount = getUniqueUserCount(filteredData);
    const userStageStats = calculateUserStageStats(filteredData);
    const reviveStats = calculateStageReviveStats(reviveData);

    const renderContent = () => {
        switch (activeTab) {
            case "overview":
                return <OverviewV2 stageStats={stageStats} />;
            case "difficulty":
                return <DifficultyV2 difficultySpikes={difficultySpikes} />;
            case "funnel":
                return <FunnelV2 events={filteredData} />;
            case "attrition":
                return <AttritionV2 data={attritionData} />;
            case "user-attrition":
                return <UserAttritionV2 data={userAttritionData} />;
            case "user-stage":
                return (
                    <UserStageV2
                        data={userStageStats}
                        reviveStats={reviveStats}
                        events={filteredData}
                        reviveEvents={reviveData}
                    />
                );
            case "revive":
                return <ReviveV2 data={reviveStats} />;
            case "first-clear":
                return <FirstClearV2 events={filteredData} />;
            case "comparison":
                return <ComparisonV2 stageStats={stageStats} />;
            default:
                return <OverviewV2 stageStats={stageStats} />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            {/* Background effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-[128px]" />
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[128px]" />
            </div>

            {/* Header */}
            <HeaderV2
                fileName={fileName}
                onUpload={onFileUpload}
                version={version}
                onVersionChange={onVersionChange}
            />

            {/* Main Content */}
            <main className="relative max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">
                {/* Metrics Grid */}
                <BentoGrid>
                    <MetricCard
                        title="총 이벤트"
                        value={filteredData.length}
                        icon={<LayoutGrid className="w-5 h-5" />}
                        gradient="purple"
                        delay={0}
                    />
                    <MetricCard
                        title="클리어율"
                        value={overallClearRate}
                        suffix="%"
                        decimals={1}
                        icon={<Trophy className="w-5 h-5" />}
                        gradient="cyan"
                        delay={0.1}
                    />
                    <MetricCard
                        title="자발적 포기율"
                        value={voluntaryExitRate}
                        suffix="%"
                        decimals={1}
                        icon={<UserMinus className="w-5 h-5" />}
                        gradient="pink"
                        delay={0.2}
                    />
                    <MetricCard
                        title="스테이지"
                        value={stageStats.length}
                        suffix="개"
                        icon={<Gamepad2 className="w-5 h-5" />}
                        gradient="orange"
                        delay={0.3}
                    />
                    <MetricCard
                        title="고유 사용자"
                        value={uniqueUserCount}
                        icon={<Users className="w-5 h-5" />}
                        gradient="purple"
                        delay={0.4}
                    />
                </BentoGrid>

                {/* Filter Panel */}
                <FilterPanelV2
                    filters={filters}
                    onChange={setFilters}
                    availableCountries={availableCountries}
                    isExpanded={isFilterExpanded}
                    onToggle={() => setIsFilterExpanded(!isFilterExpanded)}
                />

                {/* Tab Navigator */}
                <TabNavigatorV2
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />

                {/* Content Area */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {renderContent()}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
}
