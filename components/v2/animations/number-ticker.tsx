"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

interface NumberTickerProps {
    value: number;
    duration?: number;
    decimals?: number;
    suffix?: string;
    prefix?: string;
    className?: string;
}

export function NumberTicker({
    value,
    duration = 1000,
    decimals = 0,
    suffix = "",
    prefix = "",
    className,
}: NumberTickerProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, {
        damping: 60,
        stiffness: 100,
        duration: duration / 1000,
    });
    const isInView = useInView(ref, { once: true, margin: "0px" });

    useEffect(() => {
        if (isInView) {
            motionValue.set(value);
        }
    }, [isInView, value, motionValue]);

    useEffect(() => {
        const unsubscribe = springValue.on("change", (latest) => {
            if (ref.current) {
                ref.current.textContent =
                    prefix +
                    Intl.NumberFormat("ko-KR", {
                        minimumFractionDigits: decimals,
                        maximumFractionDigits: decimals,
                    }).format(Number(latest.toFixed(decimals))) +
                    suffix;
            }
        });
        return unsubscribe;
    }, [springValue, decimals, prefix, suffix]);

    return (
        <span ref={ref} className={className}>
            {prefix}0{suffix}
        </span>
    );
}
