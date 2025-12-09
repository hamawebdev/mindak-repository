"use client";

import { useEffect, useState, useRef } from "react";

type VideoQuality = "1080p" | "720p" | "480p";

interface NetworkInformation extends EventTarget {
    effectiveType?: "slow-2g" | "2g" | "3g" | "4g";
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
}

interface NavigatorWithConnection extends Navigator {
    connection?: NetworkInformation;
    mozConnection?: NetworkInformation;
    webkitConnection?: NetworkInformation;
}

export function AdaptiveHeroVideo() {
    const [videoQuality, setVideoQuality] = useState<VideoQuality>("720p"); // Default to medium
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        // Function to detect network speed and select video quality
        const detectNetworkSpeed = (): VideoQuality => {
            const nav = navigator as NavigatorWithConnection;
            const connection = nav.connection || nav.mozConnection || nav.webkitConnection;

            // If Network Information API is not supported (Safari, older browsers)
            if (!connection || !connection.effectiveType) {
                console.log("Network Information API not supported. Defaulting to 720p (medium quality)");
                return "720p";
            }

            const effectiveType = connection.effectiveType;
            console.log(`Network effective type: ${effectiveType}`);

            // Map network type to video quality
            switch (effectiveType) {
                case "4g":
                    return "1080p"; // High quality for 4G
                case "3g":
                    return "720p"; // Medium quality for 3G
                case "2g":
                case "slow-2g":
                default:
                    return "480p"; // Low quality for 2G and slower
            }
        };

        // Set initial video quality
        const quality = detectNetworkSpeed();
        setVideoQuality(quality);
        console.log(`Selected video quality: ${quality}`);

        // Listen for network changes (if supported)
        const nav = navigator as NavigatorWithConnection;
        const connection = nav.connection || nav.mozConnection || nav.webkitConnection;

        if (connection) {
            const handleNetworkChange = () => {
                const newQuality = detectNetworkSpeed();
                if (newQuality !== videoQuality) {
                    setVideoQuality(newQuality);
                    console.log(`Network changed. New video quality: ${newQuality}`);
                }
            };

            connection.addEventListener("change", handleNetworkChange);

            return () => {
                connection.removeEventListener("change", handleNetworkChange);
            };
        }
    }, []);

    // Get video source based on quality
    const getVideoSource = (): string => {
        return `/hero-studio/Hero-Studio${videoQuality}.webm`;
    };

    return (
        <div className="absolute inset-0 z-0">
            <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-full object-cover"
                key={videoQuality} // Force re-render when quality changes
            >
                <source src={getVideoSource()} type="video/webm" />
                {/* Fallback message for browsers that don't support video */}
                Your browser does not support the video tag.
            </video>
            {/* Subtle dark overlay for contrast */}
            <div className="absolute inset-0 bg-black/40" />
        </div>
    );
}
