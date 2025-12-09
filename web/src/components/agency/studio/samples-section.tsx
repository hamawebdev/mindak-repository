"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useSpring } from "framer-motion";
import { Play, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import BlurText from "@/components/ui/blur-text";
import {
    VideoPlayer,
    VideoPlayerContent,
    VideoPlayerControlBar,
    VideoPlayerPlayButton,
    VideoPlayerTimeRange,
    VideoPlayerMuteButton,
} from "@/components/ui/video-player";

interface Reel {
    id: string;
    videoUrl: string;
    posterUrl?: string;
    alt: string;
}

// Sample reel data - using actual video files from Studio/reels with cover images
const SAMPLE_REELS: Reel[] = [
    {
        id: "reel-1",
        videoUrl: "/Studio/reels/mindak.agency_14040905_112659072.mp4",
        posterUrl: "/Studio/cover/mindak.agency_14040905_112656456.jpg",
        alt: "Mindak Agency Reel 1",
    },
    {
        id: "reel-2",
        videoUrl: "/Studio/reels/mindak.agency_14040905_112708330.mp4",
        posterUrl: "/Studio/cover/mindak.agency_14040905_112705598.jpg",
        alt: "Mindak Agency Reel 2",
    },
    {
        id: "reel-3",
        videoUrl: "/Studio/reels/mindak.agency_14040905_112721931.mp4",
        posterUrl: "/Studio/cover/mindak.agency_14040905_112718830.jpg",
        alt: "Mindak Agency Reel 3",
    },
    {
        id: "reel-4",
        videoUrl: "/Studio/reels/mindak.agency_14040905_112737932.mp4",
        posterUrl: "/Studio/cover/mindak.agency_14040905_112735029.jpg",
        alt: "Mindak Agency Reel 4",
    },
    {
        id: "reel-5",
        videoUrl: "/Studio/reels/mindak.agency_14040905_113212718.mp4",
        posterUrl: "/Studio/cover/mindak.agency_14040905_113209441.jpg",
        alt: "Mindak Agency Reel 5",
    },
    {
        id: "reel-6",
        videoUrl: "/Studio/reels/mindak.agency_14040905_113221927.mp4",
        posterUrl: "/Studio/cover/mindak.agency_14040905_113218761.jpg",
        alt: "Mindak Agency Reel 6",
    },
    {
        id: "reel-7",
        videoUrl: "/Studio/reels/mindak.agency_14040905_113230555.mp4",
        posterUrl: "/Studio/cover/mindak.agency_14040905_113226935.jpg",
        alt: "Mindak Agency Reel 7",
    },
    {
        id: "reel-8",
        videoUrl: "/Studio/reels/mindak.agency_14040905_113239278.mp4",
        posterUrl: "/Studio/cover/mindak.agency_14040905_113236158.jpg",
        alt: "Mindak Agency Reel 8",
    },
    {
        id: "reel-9",
        videoUrl: "/Studio/reels/mindak.studio_14040905_113250483.mp4",
        posterUrl: "/Studio/cover/mindak.studio_14040905_113247770.jpg",
        alt: "Mindak Studio Reel 9",
    },
    {
        id: "reel-10",
        videoUrl: "/Studio/reels/younes_aithamou_14040905_112601144.mp4",
        posterUrl: "/Studio/cover/younes_aithamou_14040905_112552946.jpg",
        alt: "Younes Aithamou Reel 10",
    },
    {
        id: "reel-11",
        videoUrl: "/Studio/reels/younes_aithamou_14040905_112635140.mp4",
        posterUrl: "/Studio/cover/younes_aithamou_14040905_112631772.jpg",
        alt: "Younes Aithamou Reel 11",
    },
    {
        id: "reel-12",
        videoUrl: "/Studio/reels/younes_aithamou_14040905_112643459.mp4",
        posterUrl: "/Studio/cover/younes_aithamou_14040905_112640575.jpg",
        alt: "Younes Aithamou Reel 12",
    },
];

// Reel dimensions and spacing (in pixels)
// Optimized for best UX across mobile and desktop devices
// 9:16 aspect ratio (standard mobile video format - Instagram/TikTok reels)
const REEL_WIDTH = 280;      // Optimal width for mobile touch targets and desktop viewing
const REEL_HEIGHT = 498;     // Maintains 9:16 ratio (280 × 1.778 ≈ 498)
const REEL_SPACING = 24;     // Comfortable spacing for visual separation 

export function SamplesSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [selectedReel, setSelectedReel] = useState<Reel | null>(null);

    const scrollLeft = () => {
        if (containerRef.current) {
            containerRef.current.scrollBy({ left: -(REEL_WIDTH + REEL_SPACING), behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (containerRef.current) {
            containerRef.current.scrollBy({ left: REEL_WIDTH + REEL_SPACING, behavior: 'smooth' });
        }
    };

    // Handle reel click to open video player modal
    const handleReelClick = (reel: Reel) => {
        setSelectedReel(reel);
    };


    return (
        <section id="reels" className="relative w-full overflow-hidden bg-black py-24">
            {/* Section Title */}
            <div className="mb-16 px-6 text-center md:px-12">
                <h2 className="font-custom-sans text-5xl font-medium text-white md:text-6xl lg:text-7xl flex flex-col items-center gap-2 tracking-[-0.04em]">
                    <BlurText
                        text="extraits de"
                        className="font-custom-sans text-5xl font-medium text-white md:text-6xl lg:text-7xl tracking-[-0.04em]"
                        delay={50}
                        animateBy="letters"
                    />
                    <BlurText
                        text="nos productions"
                        className="font-emphasis text-5xl font-bold text-white md:text-6xl lg:text-7xl tracking-[-0.04em]"
                        delay={50}
                        animateBy="letters"
                    />
                </h2>

            </div>

            {/* Video Player Modal */}
            <AnimatePresence>
                {selectedReel && (
                    <VideoPopOver
                        reel={selectedReel}
                        onClose={() => setSelectedReel(null)}
                    />
                )}
            </AnimatePresence>

            {/* Reels Container Wrapper */}
            <div className="relative w-full">
                {/* Gradient Overlays for fade effect */}
                <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-32 bg-gradient-to-r from-black to-transparent md:w-48" />
                <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-32 bg-gradient-to-l from-black to-transparent md:w-48" />

                {/* Left Arrow - Fixed to left viewport edge */}
                <button
                    onClick={scrollLeft}
                    className="absolute left-0 top-1/2 z-20 -translate-y-1/2 rounded-r-xl bg-white/10 p-4 backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105 active:scale-95"
                    aria-label="Scroll left"
                >
                    <ChevronLeft className="h-8 w-8 text-white" />
                </button>

                {/* Right Arrow - Fixed to right viewport edge */}
                <button
                    onClick={scrollRight}
                    className="absolute right-0 top-1/2 z-20 -translate-y-1/2 rounded-l-xl bg-white/10 p-4 backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105 active:scale-95"
                    aria-label="Scroll right"
                >
                    <ChevronRight className="h-8 w-8 text-white" />
                </button>

                {/* Reels Scrollable Track */}
                <div ref={containerRef} className="relative w-full overflow-x-auto hide-scrollbar">
                    <div
                        className="flex"
                        style={{
                            gap: `${REEL_SPACING}px`,
                            paddingLeft: '5rem', /* Increased padding to accommodate arrows */
                            paddingRight: '5rem',
                        }}
                    >
                        {SAMPLE_REELS.map((reel) => (
                            <ReelItem
                                key={reel.id}
                                reel={reel}
                                onClick={() => handleReelClick(reel)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

// Reel Item Component with hover effects
interface ReelItemProps {
    reel: Reel;
    onClick: () => void;
}

const ReelItem = ({ reel, onClick }: ReelItemProps) => {
    const [isHovered, setIsHovered] = useState(false);

    const SPRING = {
        mass: 0.1,
    };

    const x = useSpring(0, SPRING);
    const y = useSpring(0, SPRING);
    const opacity = useSpring(0, SPRING);

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        opacity.set(1);
        const bounds = e.currentTarget.getBoundingClientRect();
        x.set(e.clientX - bounds.left);
        y.set(e.clientY - bounds.top);
    };

    return (
        <div
            className={`reel-item relative flex-shrink-0 cursor-pointer overflow-hidden rounded-2xl shadow-2xl transition-all duration-500 ease-out ${isHovered ? 'scale-[1.08] shadow-[0_20px_60px_rgba(0,0,0,0.8)]' : ''}`}
            style={{
                width: `${REEL_WIDTH}px`,
                height: `${REEL_HEIGHT}px`,
            }}
            onMouseMove={handlePointerMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
                opacity.set(0);
                setIsHovered(false);
            }}
            onClick={onClick}
        >
            {/* Background Poster Image */}
            <img
                src={reel.posterUrl}
                alt={reel.alt}
                className="h-full w-full object-cover"
            />


            {/* Play Icon Overlay - Shows on hover with scale animation */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-all duration-500 hover:opacity-100">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/95 backdrop-blur-sm transition-all duration-500 hover:scale-110 hover:bg-white">
                    <svg
                        className="ml-1 h-10 w-10 text-black transition-transform duration-500 hover:scale-110"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </div>
            </div>

            {/* Overlay gradient for better visual effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 hover:opacity-100" />


        </div>
    );
};

// Video Player Modal Component
interface VideoPopOverProps {
    reel: Reel;
    onClose: () => void;
}

const VideoPopOver = ({ reel, onClose }: VideoPopOverProps) => {
    return (
        <div className="fixed left-0 top-0 z-[101] flex h-screen w-screen items-center justify-center">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-background/90 absolute left-0 top-0 h-full w-full backdrop-blur-lg"
                onClick={onClose}
            ></motion.div>
            <motion.div
                initial={{ clipPath: "inset(43.5% 43.5% 33.5% 43.5% )", opacity: 0 }}
                animate={{ clipPath: "inset(0 0 0 0)", opacity: 1 }}
                exit={{
                    clipPath: "inset(43.5% 43.5% 33.5% 43.5% )",
                    opacity: 0,
                    transition: {
                        duration: 1,
                        type: "spring",
                        stiffness: 100,
                        damping: 20,
                        opacity: { duration: 0.2, delay: 0.8 },
                    },
                }}
                transition={{
                    duration: 1,
                    type: "spring",
                    stiffness: 100,
                    damping: 20,
                }}
                className="relative aspect-[9/16] max-h-[90vh]"
            >
                <VideoPlayer style={{ width: "100%", height: "100%" }}>
                    <VideoPlayerContent
                        src={reel.videoUrl}
                        poster={reel.posterUrl}
                        autoPlay
                        slot="media"
                        className="w-full object-cover"
                        style={{ width: "100%", height: "100%" }}
                    />

                    {/* Close Button (X) - Black color with glassy background */}
                    <span
                        onClick={onClose}
                        className="absolute right-2 top-2 z-10 cursor-pointer rounded-full bg-white/10 p-2 backdrop-blur-md transition-all hover:bg-white/20 hover:scale-110"
                    >
                        <Plus className="size-5 rotate-45 text-black" />
                    </span>

                    {/* Control Bar - Black controls with glassy background */}
                    <VideoPlayerControlBar className="absolute bottom-0 left-1/2 flex w-full max-w-7xl -translate-x-1/2 items-center justify-center gap-2 rounded-t-xl bg-white/10 px-5 py-3 backdrop-blur-md md:px-10 md:py-4 [&_*]:text-black">
                        <VideoPlayerPlayButton className="h-5 w-5 bg-transparent text-black [&_svg]:fill-black" />
                        <VideoPlayerTimeRange className="flex-1 bg-transparent [&_*]:text-black" />
                        <VideoPlayerMuteButton className="h-5 w-5 bg-transparent text-black [&_svg]:fill-black" />
                    </VideoPlayerControlBar>
                </VideoPlayer>
            </motion.div>
        </div>
    );
};


