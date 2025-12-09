"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useSpring } from "framer-motion";
import { Play, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import BlurText from "@/components/ui/blur-text";

interface YouTubeVideo {
    id: string;
    videoId: string;
    embedCode: string;
    thumbnailUrl: string;
    title: string;
}

// Extracted from lines 1-12 of youtube.txt
const YOUTUBE_VIDEOS: YouTubeVideo[] = [
    {
        id: "vid-1",
        videoId: "HAVzQLzOLN8",
        embedCode: '<iframe width="560" height="315" src="https://www.youtube.com/embed/HAVzQLzOLN8?si=WM5jhxGLj7HfvFUG" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>',
        thumbnailUrl: "https://img.youtube.com/vi/HAVzQLzOLN8/maxresdefault.jpg",
        title: "Video 1",
    },
    {
        id: "vid-2",
        videoId: "nmH-do0z-wc",
        embedCode: '<iframe width="560" height="315" src="https://www.youtube.com/embed/nmH-do0z-wc?si=ZtjgbU1rk0aQ-agL" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>',
        thumbnailUrl: "https://img.youtube.com/vi/nmH-do0z-wc/maxresdefault.jpg",
        title: "Video 2",
    },
    {
        id: "vid-3",
        videoId: "EXQ4ZNl--7A",
        embedCode: '<iframe width="560" height="315" src="https://www.youtube.com/embed/EXQ4ZNl--7A?si=ljKTA3xlBOmdc0or" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>',
        thumbnailUrl: "https://img.youtube.com/vi/EXQ4ZNl--7A/maxresdefault.jpg",
        title: "Video 3",
    },
    {
        id: "vid-4",
        videoId: "GyxjgyYWvwI",
        embedCode: '<iframe width="560" height="315" src="https://www.youtube.com/embed/GyxjgyYWvwI?si=RWH2TbKsqrP8-3_x" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>',
        thumbnailUrl: "https://img.youtube.com/vi/GyxjgyYWvwI/maxresdefault.jpg",
        title: "Video 4",
    },
    {
        id: "vid-5",
        videoId: "F0G_1IYobaM",
        embedCode: '<iframe width="560" height="315" src="https://www.youtube.com/embed/F0G_1IYobaM?si=OsY1k-Xu4oO0vKHO" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>',
        thumbnailUrl: "https://img.youtube.com/vi/F0G_1IYobaM/maxresdefault.jpg",
        title: "Video 5",
    },
];

// Video dimensions and spacing (16:9 ratio)
const VIDEO_SPACING = 24;

export function VideoSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);

    const scrollLeft = () => {
        if (containerRef.current) {
            const itemWidth = containerRef.current.firstElementChild?.firstElementChild?.clientWidth || 320;
            containerRef.current.scrollBy({ left: -(itemWidth + VIDEO_SPACING), behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (containerRef.current) {
            const itemWidth = containerRef.current.firstElementChild?.firstElementChild?.clientWidth || 320;
            containerRef.current.scrollBy({ left: itemWidth + VIDEO_SPACING, behavior: 'smooth' });
        }
    };

    return (
        <section className="relative w-full overflow-hidden bg-black py-24">
            {/* Section Title */}
            <div className="mb-16 px-6 text-center md:px-12">
                <h2 className="font-custom-sans text-5xl font-medium text-white md:text-6xl lg:text-7xl flex flex-col items-center gap-2 tracking-[-0.04em]">
                    <BlurText
                        text="nos dernières"
                        className="font-custom-sans text-5xl font-medium text-white md:text-6xl lg:text-7xl tracking-[-0.04em]"
                        delay={50}
                        animateBy="letters"
                    />
                    <BlurText
                        text="vidéos"
                        className="font-emphasis text-5xl font-bold text-white md:text-6xl lg:text-7xl tracking-[-0.04em]"
                        delay={50}
                        animateBy="letters"
                    />
                </h2>
            </div>

            {/* Video Player Modal */}
            <AnimatePresence>
                {selectedVideo && (
                    <YouTubePopOver
                        video={selectedVideo}
                        onClose={() => setSelectedVideo(null)}
                    />
                )}
            </AnimatePresence>

            {/* Videos Container Wrapper */}
            <div className="relative w-full">
                {/* Gradient Overlays */}
                <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-32 bg-gradient-to-r from-black to-transparent md:w-48" />
                <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-32 bg-gradient-to-l from-black to-transparent md:w-48" />

                {/* Left Arrow */}
                <button
                    onClick={scrollLeft}
                    className="absolute left-0 top-1/2 z-20 -translate-y-1/2 rounded-r-xl bg-white/10 p-4 backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105 active:scale-95"
                    aria-label="Scroll left"
                >
                    <ChevronLeft className="h-8 w-8 text-white" />
                </button>

                {/* Right Arrow */}
                <button
                    onClick={scrollRight}
                    className="absolute right-0 top-1/2 z-20 -translate-y-1/2 rounded-l-xl bg-white/10 p-4 backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105 active:scale-95"
                    aria-label="Scroll right"
                >
                    <ChevronRight className="h-8 w-8 text-white" />
                </button>

                {/* Videos Scrollable Track */}
                <div ref={containerRef} className="relative w-full overflow-x-auto hide-scrollbar">
                    <div
                        className="flex"
                        style={{
                            gap: `${VIDEO_SPACING}px`,
                            paddingLeft: '5rem',
                            paddingRight: '5rem',
                        }}
                    >
                        {YOUTUBE_VIDEOS.map((video) => (
                            <VideoItem
                                key={video.id}
                                video={video}
                                onClick={() => setSelectedVideo(video)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

interface VideoItemProps {
    video: YouTubeVideo;
    onClick: () => void;
}

const VideoItem = ({ video, onClick }: VideoItemProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const SPRING = { mass: 0.1 };
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
            className={`cursor-pointer overflow-hidden rounded-2xl shadow-2xl transition-all duration-500 ease-out relative flex-shrink-0 w-[320px] h-[180px] md:w-[450px] md:h-[253px] lg:w-[560px] lg:h-[315px] ${isHovered ? 'scale-[1.05] shadow-[0_20px_60px_rgba(0,0,0,0.8)]' : ''}`}
            onMouseMove={handlePointerMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
                opacity.set(0);
                setIsHovered(false);
            }}
            onClick={onClick}
        >
            <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="h-full w-full object-cover"
            />

            {/* Play Icon Overlay */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-500 hover:opacity-100 group-hover:opacity-100">
                <div className={`flex h-16 w-16 items-center justify-center rounded-full bg-white/95 backdrop-blur-sm transition-all duration-500 ${isHovered ? 'scale-110 opacity-100' : 'opacity-0 scale-90'}`}>
                    <Play className="ml-1 h-8 w-8 text-black fill-black" />
                </div>
            </div>

            {/* Hover Play Button (mimicking ReelItem logic) */}
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

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 hover:opacity-100" />
        </div>
    );
};

interface YouTubePopOverProps {
    video: YouTubeVideo;
    onClose: () => void;
}

const YouTubePopOver = ({ video, onClose }: YouTubePopOverProps) => {
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
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{
                    duration: 0.3,
                    type: "spring",
                    stiffness: 100,
                    damping: 20,
                }}
                className="relative w-full max-w-5xl aspect-video mx-4"
            >
                <div className="w-full h-full overflow-hidden rounded-xl bg-black shadow-2xl relative">
                    <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1`}
                        title={video.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                        className="w-full h-full"
                    ></iframe>
                    {/* Close Button */}
                    <span
                        onClick={onClose}
                        className="absolute right-4 top-4 z-10 cursor-pointer rounded-full bg-white/10 p-2 backdrop-blur-md transition-all hover:bg-white/20 hover:scale-110"
                    >
                        <Plus className="size-6 rotate-45 text-white" />
                    </span>
                </div>
            </motion.div>
        </div>
    );
};
