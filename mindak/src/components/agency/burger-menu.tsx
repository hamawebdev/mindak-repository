"use client";

import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";

interface BurgerMenuProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function BurgerMenu({ isOpen, onToggle }: BurgerMenuProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const menuTextRef = useRef<HTMLSpanElement>(null);
  const borderRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Set initial state for all elements
    if (circleRef.current) {
      gsap.set(circleRef.current, {
        width: "0.75rem",
        height: "0.75rem",
      });
    }
    if (line1Ref.current && line2Ref.current) {
      gsap.set([line1Ref.current, line2Ref.current], {
        opacity: 0,
        scale: 0,
        rotation: 0,
        y: 0,
      });
    }
    if (buttonRef.current) {
      gsap.set(buttonRef.current, {
        width: "8.5rem",
      });
    }
    if (borderRef.current) {
      gsap.set(borderRef.current, {
        opacity: 1,
        scale: 1,
      });
    }
    if (menuTextRef.current) {
      gsap.set(menuTextRef.current, {
        opacity: 1,
        x: 0,
      });
    }
  }, []);

  // Handle menu open/close animations
  useEffect(() => {
    if (isOpen) {
      animateToX();
    } else {
      // Always animate back when closing, regardless of hover state
      animateToBurger();
    }
  }, [isOpen]);

  const animateToX = () => {
    // Kill any existing animations to prevent conflicts
    gsap.killTweensOf([
      line1Ref.current,
      line2Ref.current,
      circleRef.current,
      buttonRef.current,
      borderRef.current,
      menuTextRef.current,
    ]);

    const tl = gsap.timeline();

    // Collapse button to just the dot - slower and smoother
    tl.to(
      menuTextRef.current,
      {
        opacity: 0,
        x: 20,
        duration: 0.5,
        ease: "power3.in",
      },
      0
    )
      .to(
        borderRef.current,
        {
          opacity: 0,
          scale: 0.85,
          duration: 0.6,
          ease: "power3.in",
        },
        0
      )
      .to(
        buttonRef.current,
        {
          width: "3.5rem",
          duration: 0.7,
          ease: "power3.inOut",
        },
        0.15
      )
      .to(
        circleRef.current,
        {
          width: "3.5rem",
          height: "3.5rem",
          duration: 0.7,
          ease: "power3.inOut",
        },
        0.15
      )
      // Show lines first with better visibility
      .to(
        [line1Ref.current, line2Ref.current],
        {
          opacity: 1,
          scale: 1,
          duration: 0.35,
          ease: "back.out(1.2)",
        },
        0.6
      )
      // Then morph to X with better timing
      .to(
        line1Ref.current,
        {
          rotation: 45,
          y: 3,
          duration: 0.45,
          ease: "power3.inOut",
        },
        0.95
      )
      .to(
        line2Ref.current,
        {
          rotation: -45,
          y: -3,
          duration: 0.45,
          ease: "power3.inOut",
        },
        0.95
      )
  };

  const animateToBurger = () => {
    // Kill any existing animations to prevent conflicts
    gsap.killTweensOf([
      line1Ref.current,
      line2Ref.current,
      circleRef.current,
      buttonRef.current,
      borderRef.current,
      menuTextRef.current,
    ]);

    const tl = gsap.timeline();

    // Wait a bit for menu to start closing, then morph X back to burger lines
    tl.to(
      [line1Ref.current, line2Ref.current],
      {
        rotation: 0,
        y: 0,
        duration: 0.45,
        ease: "power3.inOut",
      },
      0.2
    )
      // Hide lines after morphing back
      .to(
        [line1Ref.current, line2Ref.current],
        {
          opacity: 0,
          scale: 0,
          duration: 0.35,
          ease: "power3.in",
        },
        0.65
      )
      // Shrink circle back to dot simultaneously
      .to(
        circleRef.current,
        {
          width: "0.75rem",
          height: "0.75rem",
          duration: 0.7,
          ease: "power3.inOut",
        },
        0.65
      )
      // Expand button back
      .to(
        buttonRef.current,
        {
          width: "8.5rem",
          duration: 0.7,
          ease: "power3.inOut",
        },
        0.65
      )
      // Show border and text expanding outward - slower and smoother
      .to(
        borderRef.current,
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: "power3.out",
        },
        1.05
      )
      .to(
        menuTextRef.current,
        {
          opacity: 1,
          x: 0,
          duration: 0.5,
          ease: "power3.out",
        },
        1.05
      );
  };

  const handleMouseEnter = () => {
    if (isOpen) return; // Don't animate on hover when menu is open
    setIsHovered(true);
    // Expand container width
    if (buttonRef.current) {
      gsap.to(buttonRef.current, {
        width: "12rem",
        duration: 0.5,
        ease: "power2.inOut",
      });
    }

    // Shift MENU text to the left
    if (menuTextRef.current) {
      gsap.to(menuTextRef.current, {
        x: -8,
        duration: 0.5,
        ease: "power2.inOut",
      });
    }

    // Expand circle to show hamburger icon
    if (circleRef.current) {
      gsap.to(circleRef.current, {
        width: "3.5rem",
        height: "3.5rem",
        duration: 0.5,
        ease: "power2.inOut",
      });
    }

    // Show hamburger lines
    if (line1Ref.current && line2Ref.current) {
      gsap.to([line1Ref.current, line2Ref.current], {
        opacity: 1,
        scale: 1,
        duration: 0.3,
        delay: 0.2,
        ease: "power2.out",
      });
    }
  };

  const handleMouseLeave = () => {
    if (isOpen) return; // Don't animate on hover when menu is open
    setIsHovered(false);

    // Hide hamburger lines
    if (line1Ref.current && line2Ref.current) {
      gsap.to([line1Ref.current, line2Ref.current], {
        opacity: 0,
        scale: 0,
        duration: 0.2,
        ease: "power2.in",
      });
    }

    // Shrink circle back to dot
    if (circleRef.current) {
      gsap.to(circleRef.current, {
        width: "0.75rem",
        height: "0.75rem",
        duration: 0.5,
        ease: "power2.inOut",
      });
    }

    // Return MENU text to original position
    if (menuTextRef.current) {
      gsap.to(menuTextRef.current, {
        x: 0,
        duration: 0.5,
        ease: "power2.inOut",
      });
    }

    // Shrink container width back
    if (buttonRef.current) {
      gsap.to(buttonRef.current, {
        width: "8.5rem",
        duration: 0.5,
        ease: "power2.inOut",
      });
    }
  };

  return (
    <button
      ref={buttonRef}
      onClick={onToggle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative overflow-visible cursor-pointer"
      style={{
        width: "8.5rem",
        height: "3.5rem",
        borderRadius: "var(--radius-lg)",
        padding: "var(--spacing)",
        pointerEvents: "auto",
        background: "transparent",
        border: "none",
        zIndex: 1,
      }}
      aria-label="Menu"
    >
      {/* Border container */}
      <div
        ref={borderRef}
        className="absolute inset-0 bg-card border border-border"
        style={{
          borderRadius: "var(--radius-lg)",
        }}
      />
      {/* MENU text - left aligned */}
      <span
        ref={menuTextRef}
        className="absolute left-8 top-1/2 -translate-y-1/2 uppercase text-card-foreground pointer-events-none"
        style={{
          fontSize: "1rem",
          fontWeight: 500,
          letterSpacing: "var(--tracking-wide)",
          lineHeight: 1,
        }}
      >
        MENU
      </span>

      {/* Circle indicator/container - right side */}
      <div
        ref={circleRef}
        className="absolute right-8 top-1/2 -translate-y-1/2 rounded-full flex items-center justify-center bg-primary"
        style={{
          width: "0.75rem",
          height: "0.75rem",
          zIndex: 100,
        }}
      >
        {/* Hamburger lines container */}
        <div className="relative w-full h-full flex flex-col items-center justify-center gap-1">
          {/* Line 1 */}
          <span
            ref={line1Ref}
            className="block rounded-full bg-primary-foreground"
            style={{
              width: "1.25rem",
              height: "2px",
              opacity: 0,
              transform: "scale(0)",
            }}
          />
          {/* Line 2 */}
          <span
            ref={line2Ref}
            className="block rounded-full bg-primary-foreground"
            style={{
              width: "1.25rem",
              height: "2px",
              opacity: 0,
              transform: "scale(0)",
            }}
          />
        </div>
      </div>
    </button>
  );
}
