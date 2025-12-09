"use client";

import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";

export default function TestLoaderPage() {
  const logoRef = useRef<HTMLImageElement>(null);
  const [showLoader, setShowLoader] = useState(true);

  // Animate logo
  useEffect(() => {
    if (showLoader && logoRef.current) {
      const logo = logoRef.current;
      
      // Set initial state
      gsap.set(logo, { 
        opacity: 0, 
        scale: 0.8,
        y: 0
      });
      
      // Create looping animation timeline
      const tl = gsap.timeline({ repeat: -1 });
      
      // Fade in and scale up
      tl.to(logo, {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: "power2.out"
      })
      // Gentle float up and down
      .to(logo, {
        y: -15,
        duration: 1.5,
        ease: "sine.inOut"
      })
      .to(logo, {
        y: 0,
        duration: 1.5,
        ease: "sine.inOut"
      });
      
      return () => {
        tl.kill();
      };
    }
  }, [showLoader]);

  return (
    <div className="relative min-h-screen">
      {/* Loader Overlay */}
      {showLoader && (
        <div 
          className="fixed inset-0 flex items-center justify-center"
          style={{ 
            backgroundColor: "#000000",
            zIndex: 9999 
          }}
        >
          <img
            ref={logoRef}
            src="/mindaklogowhite.png"
            alt="Mindak Logo"
            style={{
              width: "clamp(120px, 20vw, 200px)",
              height: "auto",
              objectFit: "contain"
            }}
          />
        </div>
      )}

      {/* Main Content */}
      <div 
        className="min-h-screen flex flex-col items-center justify-center gap-8"
        style={{ 
          backgroundColor: "#E8E4DF",
          padding: "clamp(24px, 5vw, 48px)"
        }}
      >
        <h1 
          className="text-center uppercase"
          style={{
            color: "#0E0E0E",
            fontFamily: '"Helvetica Now", "Helvetica Neue", sans-serif',
            fontSize: "clamp(32px, 6vw, 64px)",
            fontWeight: 800,
            letterSpacing: "0.05em",
            lineHeight: 1.2,
          }}
        >
          Mindak Logo Loader Test
        </h1>

        <div className="flex flex-col gap-4 items-center">
          <button
            onClick={() => setShowLoader(!showLoader)}
            className="uppercase bg-primary text-primary-foreground hover:opacity-90"
            style={{
              display: "inline-block",
              padding: "clamp(14px, 2.5vw, 18px) clamp(40px, 8vw, 80px)",
              borderRadius: "var(--radius)",
              fontSize: "clamp(14px, 2vw, 18px)",
              fontWeight: 700,
              letterSpacing: "0.05em",
              textDecoration: "none",
              fontFamily: '"Helvetica Now", "Helvetica Neue", sans-serif',
              transition: "opacity 0.2s ease",
              cursor: "pointer",
              border: "none",
            }}
          >
            {showLoader ? "Hide Loader" : "Show Loader"}
          </button>

          <Link
            href="/"
            className="uppercase text-center"
            style={{
              display: "inline-block",
              padding: "clamp(14px, 2.5vw, 18px) clamp(40px, 8vw, 80px)",
              fontSize: "clamp(14px, 2vw, 18px)",
              fontWeight: 700,
              letterSpacing: "0.05em",
              textDecoration: "none",
              fontFamily: '"Helvetica Now", "Helvetica Neue", sans-serif',
              color: "#0E0E0E",
              border: "2px solid #0E0E0E",
              borderRadius: "var(--radius)",
              transition: "all 0.2s ease",
            }}
          >
            Return to Home
          </Link>
        </div>

        <div 
          className="max-w-2xl text-center"
          style={{
            color: "#0E0E0E",
            fontFamily: '"Helvetica Now", "Helvetica Neue", sans-serif',
            fontSize: "clamp(14px, 2vw, 16px)",
            lineHeight: 1.6,
          }}
        >
          <p className="mb-4">
            This page demonstrates the Mindak logo loader with GSAP animations.
          </p>
          <p className="mb-4">
            <strong>Animation Features:</strong>
          </p>
          <ul className="list-disc list-inside text-left mx-auto max-w-md">
            <li>Fade in effect (opacity 0 → 1)</li>
            <li>Scale animation (0.8 → 1)</li>
            <li>Gentle floating motion (±15px)</li>
            <li>Smooth easing with power2.out and sine.inOut</li>
            <li>Infinite loop until content is ready</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
