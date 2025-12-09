"use client";

import { Event } from "@/types/index";
import { format } from "date-fns";

interface PodcastEventComponentProps extends Event {
    onClick?: () => void;
}

export function PodcastEventComponent(props: PodcastEventComponentProps) {
    const { title, startDate, endDate, variant, onClick } = props;
    
    const getBgColor = (variant?: string) => {
        switch (variant) {
            case "success": return "bg-green-100 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300";
            case "warning": return "bg-amber-100 border-amber-200 text-amber-800 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-300";
            default: return "bg-blue-100 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300";
        }
    };

    return (
        <div 
            onClick={(e) => {
                e.stopPropagation(); // Prevent triggering parent slot clicks if any
                onClick?.();
            }}
            className={`w-full h-full p-1 text-xs rounded border ${getBgColor(variant)} overflow-hidden cursor-pointer transition-all hover:brightness-95`}
        >
            <div className="font-semibold truncate">{title}</div>
            <div className="opacity-80 text-[10px]">
                {format(startDate, "h:mm a")} - {format(endDate, "h:mm a")}
            </div>
        </div>
    );
}
