"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface PodcastLayoutProps {
    children: React.ReactNode;
    className?: string;
}

export function PodcastLayout({ children, className }: PodcastLayoutProps) {
    return (
        <div className="relative min-h-screen w-full bg-black text-white">
            {/* Main Content */}
            <div className={cn("relative z-10 w-full px-6 md:px-12 py-8 md:py-12", className)}>
                {children}
            </div>
        </div>
    );
}
