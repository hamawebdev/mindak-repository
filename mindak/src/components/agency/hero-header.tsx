"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { BurgerMenu } from "./burger-menu";
import { FullScreenMenu } from "./full-screen-menu";
import gsap from "gsap";

interface SocialLink {
  label: string;
  href: string;
}

const socialLinks: SocialLink[] = [
  { label: "INSTAGRAM", href: "https://instagram.com" },
  { label: "LINKEDIN", href: "https://linkedin.com" },
  { label: "TWITTER", href: "https://twitter.com" },
  { label: "FACEBOOK", href: "https://facebook.com" },
];

export function HeroHeader() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const logoLoaderRef = useRef<HTMLImageElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  // Animate logo loader while video is loading
  useEffect(() => {
    if (!isVideoLoaded && logoLoaderRef.current) {
      const logo = logoLoaderRef.current;

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
  }, [isVideoLoaded]);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    const handleMouseEnter = () => {
      gsap.to(button, {
        backgroundColor: "#0b91ff",
        color: "#ffffff",
        duration: 0.7,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      gsap.to(button, {
        backgroundColor: "#ffffff",
        color: "#0E0E0E",
        duration: 0.7,
        ease: "power2.out",
      });
    };

    button.addEventListener("mouseenter", handleMouseEnter);
    button.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      button.removeEventListener("mouseenter", handleMouseEnter);
      button.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col box-border overflow-hidden" style={{ backgroundColor: "#E8E4DF" }}>
      {/* Video Loading Overlay */}
      {!isVideoLoaded && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            backgroundColor: "#000000",
            zIndex: 300
          }}
        >
          <img
            ref={logoLoaderRef}
            src="/mindak-logo.png"
            alt="Mindak Logo"
            style={{
              width: "clamp(120px, 20vw, 200px)",
              height: "auto",
              objectFit: "contain"
            }}
          />
        </div>
      )}

      {/* Video Background */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ zIndex: 0 }}
        onCanPlayThrough={() => setIsVideoLoaded(true)}
        onLoadedData={() => {
          // Fallback in case canplaythrough doesn't fire
          if (videoRef.current && videoRef.current.readyState >= 3) {
            setIsVideoLoaded(true);
          }
        }}
      >
        <source src="/mindakagencybackground.mp4" type="video/mp4" />
      </video>

      {/* Header Navigation */}
      <header className="absolute top-0 left-0 right-0 w-full -mt-2 sm:-mt-3 md:-mt-4 px-2 sm:px-3 md:px-4 lg:px-6 box-border" style={{ zIndex: 200 }}>
        <div className="flex items-center justify-between">
          {/* Logo - Left */}
          <div className="flex-shrink-0">
            <Image
              src="/mindaklogowhite.png"
              alt="Mindak Logo"
              width={120}
              height={120}
              className="object-contain"
              style={{
                width: "120px",
                height: "120px",
              }}
              priority
            />
          </div>

          {/* Burger Menu - Right */}
          <div className="flex-shrink-0">
            <BurgerMenu isOpen={isMenuOpen} onToggle={toggleMenu} />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center flex-col relative px-4 sm:px-6 md:px-10 lg:px-16 py-12 sm:py-16 md:py-20 box-border min-h-screen" style={{ zIndex: 100 }}>
        <div className="flex flex-col justify-center items-center relative w-full max-w-[1200px] gap-6 sm:gap-8 md:gap-10">
          {/* Main Title */}
          <h1 className="m-0 p-0 text-center relative w-full">
            <span
              className="block font-black m-0 p-0 text-white"
              style={{
                fontSize: "clamp(72px, 18vw, 280px)",
                lineHeight: 0.9,
                letterSpacing: "-0.04em",
                WebkitFontSmoothing: "antialiased",
                textRendering: "optimizeLegibility",
                textShadow: "0 4px 20px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)",
                fontWeight: 900
              }}
            >
              MINDAK
            </span>
          </h1>

          {/* Tagline */}
          <div className="relative text-center box-border px-2 sm:px-4 md:px-6">
            <p
              className="m-0 max-w-[85vw] sm:max-w-[600px] md:max-w-[850px] lg:max-w-[950px] xl:max-w-[1100px] mx-auto text-white/95"
              style={{
                fontSize: "clamp(15px, 3.8vw, 20px)",
                fontWeight: 400,
                lineHeight: 1.6,
                WebkitFontSmoothing: "antialiased",
                fontKerning: "normal",
                textShadow: "0 2px 12px rgba(0, 0, 0, 0.4), 0 1px 4px rgba(0, 0, 0, 0.3)",
                letterSpacing: "0.01em"
              }}
            >
              Nous sommes une agence web à Lyon avec un savoir-faire de précision. Pour créer
              <br />
              des sites et des designs, nous mobilisons l'audace et notre amour du détail qui tue.
            </p>
          </div>

          {/* CTA Button */}
          <div className="relative text-center mt-2 sm:mt-4">
            <button
              ref={buttonRef}
              onClick={() => setIsMenuOpen(true)}
              className="px-10 sm:px-12 md:px-14 py-4 sm:py-5 rounded-full shadow-xl hover:shadow-2xl transition-shadow duration-300"
              style={{
                backgroundColor: "#ffffff",
                color: "#0E0E0E",
                fontSize: "clamp(15px, 3.5vw, 18px)",
                fontWeight: 700,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                border: "2px solid #ffffff",
                cursor: "pointer",
                WebkitFontSmoothing: "antialiased",
              }}
            >
              Réserver
            </button>
          </div>
        </div>
      </section>

      {/* Social Links Footer */}
      <footer
        className="absolute left-0 right-0 flex flex-col justify-end box-border bottom-8 md:bottom-12 lg:bottom-0"
        style={{
          padding: "0 clamp(20px, 4vw, 40.192px)",
          zIndex: 100,
        }}
      >
        <ul
          className="flex justify-between overflow-hidden relative box-border list-none m-0 pt-5 md:pt-8 lg:pt-0"
        >
          {socialLinks.map((link, index) => (
            <li key={index}>
              <a
                href={link.href}
                className="relative cursor-pointer uppercase transition-opacity duration-200 hover:opacity-70 block text-white"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: "clamp(12px, 2.5vw, 22.1056px)",
                  fontWeight: 700,
                  letterSpacing: "clamp(-0.6px, -0.15vw, -1.10528px)",
                  lineHeight: "clamp(16px, 3.5vw, 30.9479px)",
                  WebkitFontSmoothing: "antialiased",
                  fontKerning: "none",
                  transform: "matrix(1, 0, 0, 1, 0, 0)",
                }}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </footer>

      {/* Full Screen Menu */}
      <FullScreenMenu isOpen={isMenuOpen} />
    </div>
  );
}
