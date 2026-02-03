"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import React from "react";

interface BentoGridProps {
    children: React.ReactNode;
    className?: string;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
        },
    },
};

export function BentoGrid({ children, className }: BentoGridProps) {
    return (
        <motion.div
            className={cn(
                "grid gap-4",
                "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
                className,
            )}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {children}
        </motion.div>
    );
}

interface BentoItemProps {
    children: React.ReactNode;
    className?: string;
    colSpan?: 1 | 2 | 3;
    rowSpan?: 1 | 2;
}

const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: "spring" as const,
            stiffness: 100,
            damping: 15,
        },
    },
};

export function BentoItem({
    children,
    className,
    colSpan = 1,
    rowSpan = 1,
}: BentoItemProps) {
    const colSpanClass = {
        1: "",
        2: "sm:col-span-2",
        3: "sm:col-span-2 lg:col-span-3",
    };

    const rowSpanClass = {
        1: "",
        2: "row-span-2",
    };

    return (
        <motion.div
            className={cn(colSpanClass[colSpan], rowSpanClass[rowSpan], className)}
            variants={itemVariants}
        >
            {children}
        </motion.div>
    );
}
