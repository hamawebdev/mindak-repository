"use client";

import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";

interface MenuItem {
    label: string;
    href: string;
}

const menuItems: MenuItem[] = [
    { label: "Vidéos", href: "#reels" },
    { label: "Équipements", href: "#equipments" },
    { label: "À propos", href: "#about" },
    { label: "FAQ", href: "#faq" },
    { label: "Contact", href: "#contact" },
];

interface StudioFullScreenMenuProps {
    isOpen: boolean;
    onClose?: () => void;
}

export function StudioFullScreenMenu({ isOpen, onClose }: StudioFullScreenMenuProps) {
    const overlayRef = useRef<HTMLDivElement>(null);
    const menuItemsRef = useRef<(HTMLLIElement | null)[]>([]);

    useEffect(() => {
        if (!overlayRef.current) return;

        if (isOpen) {
            // Show menu with slide-up animation
            const tl = gsap.timeline();

            // Set initial state
            gsap.set(overlayRef.current, {
                display: "flex",
                y: "100%",
            });

            gsap.set(menuItemsRef.current, {
                opacity: 0,
                y: 80,
            });

            // Animate overlay sliding up - slower and smoother
            tl.to(overlayRef.current, {
                y: "0%",
                duration: 1.2,
                ease: "power4.out",
            })
                // Stagger menu items appearing with more delay
                .to(
                    menuItemsRef.current,
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        stagger: 0.15,
                        ease: "power3.out",
                    },
                    "-=0.6"
                );
        } else {
            // Hide menu with slide-down animation
            const tl = gsap.timeline();

            // Fade out menu items first
            tl.to(menuItemsRef.current, {
                opacity: 0,
                y: -30,
                duration: 0.4,
                stagger: 0.08,
                ease: "power2.in",
            })
                // Slide overlay down - smoother
                .to(overlayRef.current, {
                    y: "100%",
                    duration: 1.0,
                    ease: "power4.in",
                }, "-=0.2")
                // Hide after animation
                .set(overlayRef.current, {
                    display: "none",
                });
        }
    }, [isOpen]);

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 flex-col items-center justify-center"
            style={{
                backgroundColor: "#0E0E0E",
                display: "none",
                zIndex: 100,
            }}
        >
            <nav className="w-full max-w-4xl px-8">
                <ul className="flex flex-col gap-6 md:gap-8 list-none m-0 p-0">
                    {menuItems.map((item, index) => (
                        <li
                            key={index}
                            ref={(el) => {
                                menuItemsRef.current[index] = el;
                            }}
                            className="text-center"
                        >
                            <a
                                href={item.href}
                                onClick={onClose}
                                className="block transition-opacity duration-200 hover:opacity-70 font-custom-sans"
                                style={{
                                    color: "#E8E4DF",
                                    fontSize: "clamp(40px, 8vw, 80px)",
                                    fontWeight: 500,
                                    letterSpacing: "-0.04em",
                                    lineHeight: 1.2,
                                    textDecoration: "none",
                                    WebkitFontSmoothing: "antialiased",
                                }}
                            >
                                {item.label}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>

        </div>
    );
}
