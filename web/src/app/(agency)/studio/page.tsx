"use client";

import React, { useState } from "react";
import Image from "next/image";
import Button from "@/components/ui/cta-button";
import { StudioBurgerMenu } from "@/components/agency/studio/studio-burger-menu";
import { StudioFullScreenMenu } from "@/components/agency/studio/studio-full-screen-menu";
import { SamplesSection } from "@/components/agency/studio/samples-section";
import { VideoSection } from "@/components/agency/studio/video-section";
import { AboutUsSection } from "@/components/agency/studio/about-us-section";
import { TestimonialsSectionDemo } from "@/components/ui/testmonial-demo";
import { FAQSection } from "@/components/agency/studio/faq-section";
import { FooterSection } from "@/components/agency/studio/footer-section";
import { Link005 } from "@/components/ui/links";
import BlurText from "@/components/ui/blur-text";
import { MaterialSection } from "@/components/ui/material";
import { AdaptiveHeroVideo } from "@/components/agency/studio/adaptive-hero-video";


export default function StudioPage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen((prev) => !prev);
    };

    return (
        <main className="relative min-h-screen w-full bg-black font-sans">
            <style dangerouslySetInnerHTML={{
                __html: `
        @font-face {
          font-family: 'Helvetica Neue Local';
          src: url('/helveticaneue-medium.ttf') format('truetype');
          font-weight: 500;
          font-style: normal;
        }
        @font-face {
          font-family: 'Riccione Serial';
          src: url('/fonnts.com-riccione_serial-italic.otf') format('opentype');
          font-style: italic;
          font-weight: normal;
        }
        .font-custom-sans {
          font-family: 'Helvetica Neue Local', 'Helvetica Neue', sans-serif;
          font-weight: 500;
        }
        .font-emphasis {
          font-family: 'Riccione Serial', serif;
          font-style: italic;
        }
        /* Apply HelveticaNeue Medium globally to the studio page */
        main {
          font-family: 'Helvetica Neue Local', 'Helvetica Neue', sans-serif;
          font-weight: 500;
        }
      `}} />

            {/* Hero Section with Background */}
            <section className="relative min-h-screen w-full overflow-hidden">
                {/* Background Video - Only for Hero */}
                <AdaptiveHeroVideo />

                {/* Header */}
                <header className="absolute left-0 top-0 z-[102] flex w-full items-center justify-between pl-0 pr-6 md:px-12" style={{ paddingTop: '0px' }}>
                    {/* Logo */}
                    <div className={`relative overflow-hidden ${isMenuOpen ? 'opacity-0 pointer-events-none' : ''}`} style={{ height: '100px', width: '151px' }}>
                        <Image
                            src="/Studio/mindakstudiologo.png"
                            alt="Mindak Studio Logo"
                            fill
                            className="object-fill scale-250"
                        />
                    </div>

                    {/* Desktop Navigation */}
                    <nav className={`hidden md:flex items-center ${isMenuOpen ? 'opacity-0 pointer-events-none' : ''}`} style={{ gap: '43.85px' }}>
                        {[
                            { label: "Vidéos", href: "#reels" },
                            { label: "Équipements", href: "#equipments" },
                            { label: "À propos", href: "#about" },
                            { label: "FAQ", href: "#faq" },
                            { label: "Contact", href: "#contact" },
                        ].map((item) => (
                            <Link005
                                key={item.label}
                                href={item.href}
                                className="text-white font-medium font-custom-sans tracking-wide text-[25px]"
                            >
                                {item.label}
                            </Link005>
                        ))}
                    </nav>

                    {/* Mobile Menu Icon */}
                    <div className="flex-shrink-0">
                        <StudioBurgerMenu isOpen={isMenuOpen} onToggle={toggleMenu} />
                    </div>
                </header>

                {/* Hero Content */}
                <div className="relative z-10 flex min-h-screen flex-col items-center text-center">
                    <div className="flex flex-col items-center w-full px-6 md:px-12" style={{ paddingTop: '214.83px' }}>

                        {/* Headline */}
                        <h1 className="flex flex-col items-center text-[62px] font-medium leading-none tracking-[-0.04em] text-white font-custom-sans gap-2 md:gap-3">
                            <BlurText
                                text="Your Story."
                                className="drop-shadow-lg text-[62px] font-medium leading-none tracking-[-0.04em] text-white font-custom-sans"
                                delay={50}
                                animateBy="letters"
                            />
                            <BlurText
                                text="Our Setup."
                                className="drop-shadow-lg text-[62px] font-medium leading-none tracking-[-0.04em] text-white font-custom-sans"
                                delay={50}
                                animateBy="letters"
                            />
                            <BlurText
                                text="Their Ears."
                                className="drop-shadow-lg text-[62px] font-bold leading-none tracking-[-0.04em] text-white font-emphasis"
                                delay={50}
                                animateBy="letters"
                            />
                        </h1>

                        {/* Sub-text */}
                        <div className="text-white/85 text-sm md:text-lg lg:text-xl font-light drop-shadow-md font-custom-sans leading-relaxed" style={{ marginTop: '30px' }}>
                            <span className="md:hidden">Un espace professionnel, un son de qualité<br />et du matériel fiable. Réservez votre créneau</span>
                            <span className="hidden md:block">Un espace professionnel, un son de qualité et du matériel fiable.<br />Réservez votre créneau</span>
                        </div>

                        {/* CTA Button */}
                        <div style={{ marginTop: '80px' }}>
                            <Button />
                        </div>
                    </div>
                </div>
            </section>

            {/* Samples Section */}
            <SamplesSection />

            {/* Video Section */}
            <VideoSection />

            {/* About Us Section */}
            <AboutUsSection />

            {/* Material Section */}
            <MaterialSection />

            {/* Testimonials Section */}
            <TestimonialsSectionDemo />

            {/* FAQ Section */}
            <FAQSection />

            {/* Footer Section */}
            <FooterSection />

            {/* Full Screen Menu */}
            <StudioFullScreenMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        </main>
    );
}
