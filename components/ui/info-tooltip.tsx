"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface InfoTooltipProps {
    label: string;
    description: string;
    className?: string;
}

export function InfoTooltip({ label, description, className = "" }: InfoTooltipProps) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <span className={`cursor-help inline-flex items-center gap-1 ${className}`}>
                    {label}
                    <span className="text-slate-500 text-xs">ⓘ</span>
                </span>
            </TooltipTrigger>
            <TooltipContent 
                side="top" 
                className="max-w-xs bg-slate-900 text-slate-100 border border-slate-700 shadow-lg"
            >
                <p>{description}</p>
            </TooltipContent>
        </Tooltip>
    );
}

interface TableHeaderTooltipProps {
    label: string;
    description: string;
    align?: "left" | "right";
    className?: string;
}

export function TableHeaderTooltip({ 
    label, 
    description, 
    align = "right",
    className = "" 
}: TableHeaderTooltipProps) {
    return (
        <th className={`p-2 ${align === "left" ? "text-left" : "text-right"} ${className}`}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <span className="cursor-help inline-flex items-center gap-1">
                        {label}
                        <span className="text-slate-500 text-xs">ⓘ</span>
                    </span>
                </TooltipTrigger>
                <TooltipContent 
                    side="top" 
                    className="max-w-xs bg-slate-900 text-slate-100 border border-slate-700 shadow-lg"
                >
                    <p>{description}</p>
                </TooltipContent>
            </Tooltip>
        </th>
    );
}


