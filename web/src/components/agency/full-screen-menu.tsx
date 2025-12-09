"use client";

import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";

interface MenuItem {
  label: string;
  href: string;
}

const menuItems: MenuItem[] = [
  { label: "Réserver un service", href: "/briefing" },
  { label: "Réserver un podcast", href: "podcast" },
];

interface FullScreenMenuProps {
  isOpen: boolean;
}

export function FullScreenMenu({ isOpen }: FullScreenMenuProps) {
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
                className="block transition-opacity duration-200 hover:opacity-70"
                style={{
                  color: "#E8E4DF",
                  fontSize: "clamp(40px, 8vw, 80px)",
                  fontWeight: 700,
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

      {/* Footer info */}
      <div
        className="absolute bottom-12 left-0 right-0 flex justify-center gap-8 px-8"
        style={{
          color: "#E8E4DF",
          fontSize: "clamp(12px, 2vw, 16px)",
          fontWeight: 400,
          opacity: 0.7,
        }}
      >
        <span>LYON, FRANCE</span>
        <span>•</span>
        <span>HELLO@MINDAK.FR</span>
      </div>
    </div>
  );
}
