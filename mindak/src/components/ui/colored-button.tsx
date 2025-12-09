import React from "react";
import { cn } from "@/lib/utils";

interface ColoredButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children?: React.ReactNode;
}

export function ColoredButton({ className, children, ...props }: ColoredButtonProps) {
    return (
        <button
            className={cn(
                "group relative inline-block cursor-pointer rounded-xl bg-[#55FF6D] p-px font-extrabold font-['Helvetica_Neue',_sans-serif] text-2xl text-black shadow-2xl shadow-zinc-900 transition-transform duration-300 ease-in-out hover:scale-105 active:scale-95",
                className
            )}
            {...props}
        >
            <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#d6ffd2] via-[#85f47b] via-[#99c0ff] to-[#4583ff] p-px opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:p-[3px]"></span>

            <span className="relative z-10 block rounded-xl bg-[#55FF6D] px-12 py-6">
                <div className="relative z-10 flex items-center space-x-2">
                    <span className="transition-all duration-500 group-hover:translate-x-1">
                        {children || "Let's get started"}
                    </span>
                    <svg
                        className="h-6 w-6 transition-transform duration-500 group-hover:translate-x-1"
                        data-slot="icon"
                        aria-hidden="true"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            clipRule="evenodd"
                            d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
                            fillRule="evenodd"
                        ></path>
                    </svg>
                </div>
            </span>
        </button>
    );
}
