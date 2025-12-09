"use client";

import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";

interface StudioBurgerMenuProps {
    isOpen: boolean;
    onToggle: () => void;
}

export function StudioBurgerMenu({ isOpen, onToggle }: StudioBurgerMenuProps) {
    const line1Ref = useRef<HTMLSpanElement>(null);
    const line2Ref = useRef<HTMLSpanElement>(null);
    const line3Ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        // Set initial state
        if (line1Ref.current && line2Ref.current && line3Ref.current) {
            gsap.set([line1Ref.current, line2Ref.current, line3Ref.current], {
                transformOrigin: "center center",
            });
        }
    }, []);

    // Handle menu open/close animations
    useEffect(() => {
        if (isOpen) {
            animateToX();
        } else {
            animateToBurger();
        }
    }, [isOpen]);

    const animateToX = () => {
        const tl = gsap.timeline();

        // Animate to X
        tl.to(line2Ref.current, {
            opacity: 0,
            scale: 0,
            duration: 0.2,
            ease: "power2.in",
        })
            .to(line1Ref.current, {
                y: 6,
                rotation: 45,
                duration: 0.4,
                ease: "power3.inOut",
            }, 0.1)
            .to(line3Ref.current, {
                y: -6,
                rotation: -45,
                duration: 0.4,
                ease: "power3.inOut",
            }, 0.1);
    };

    const animateToBurger = () => {
        const tl = gsap.timeline();

        // Animate back to burger
        tl.to([line1Ref.current, line3Ref.current], {
            y: 0,
            rotation: 0,
            duration: 0.4,
            ease: "power3.inOut",
        })
            .to(line2Ref.current, {
                opacity: 1,
                scale: 1,
                duration: 0.2,
                ease: "power2.out",
            }, 0.2);
    };

    return (
        <button
            onClick={onToggle}
            className="relative flex flex-col items-center justify-center gap-[4px] w-10 h-10 bg-transparent border-none cursor-pointer z-[101]"
            aria-label="Menu"
        >
            <span
                ref={line1Ref}
                className="block w-8 h-[2px] bg-white rounded-full"
            />
            <span
                ref={line2Ref}
                className="block w-8 h-[2px] bg-white rounded-full"
            />
            <span
                ref={line3Ref}
                className="block w-8 h-[2px] bg-white rounded-full"
            />
        </button>
    );
}
