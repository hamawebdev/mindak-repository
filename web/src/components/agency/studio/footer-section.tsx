"use client";

import React, { useEffect, useRef } from "react";
import { Instagram, Facebook, Linkedin } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Link005 } from "@/components/ui/links";
import BlurText from "@/components/ui/blur-text";
import { SocialLinksButton } from "@/components/ui/social-links-button";
import gsap from "gsap";

export function FooterSection() {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const scrollTextRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!scrollContainerRef.current || !scrollTextRef.current) return;

        const scrollText = scrollTextRef.current;
        // We have 4 copies, so we animate by 1/4th of the width to loop seamlessly
        const oneSetWidth = scrollText.offsetWidth / 4;

        // Set initial position
        gsap.set(scrollText, { x: 0 });

        // Create seamless infinite scroll animation
        const animation = gsap.to(scrollText, {
            x: -oneSetWidth,
            duration: 15, // Adjusted duration for the shorter text
            ease: "none",
            repeat: -1,
            modifiers: {
                x: gsap.utils.unitize((x) => parseFloat(x) % oneSetWidth)
            }
        });

        return () => {
            animation.kill();
        };
    }, []);

    return (
        <footer id="contact" className="relative w-full bg-black text-white overflow-hidden">
            {/* Main Footer Content */}
            <div className="relative z-10 px-6 md:px-12 lg:px-20">
                {/* Heading Section */}
                <div className="pt-24 md:pt-32 lg:pt-40 pb-16 md:pb-20 lg:pb-24">
                    <h2 className="text-center font-custom-sans flex flex-col items-center gap-2">
                        <div className="flex flex-wrap justify-center items-center gap-x-4">
                            <BlurText
                                text="Set Up,"
                                className="text-[32px] sm:text-[48px] md:text-[64px] lg:text-[80px] xl:text-[90px] font-medium leading-[1.15] tracking-[-0.04em] font-custom-sans"
                                delay={50}
                                animateBy="letters"
                            />
                            <BlurText
                                text="Sit Down"
                                className="text-[32px] sm:text-[48px] md:text-[64px] lg:text-[80px] xl:text-[90px] font-emphasis italic font-normal leading-[1.15] tracking-[-0.04em]"
                                delay={50}
                                animateBy="letters"
                            />
                        </div>
                        <div className="flex flex-wrap justify-center items-center gap-x-4">
                            <BlurText
                                text="& let's Get"
                                className="text-[32px] sm:text-[48px] md:text-[64px] lg:text-[80px] xl:text-[90px] font-medium leading-[1.15] tracking-[-0.04em] font-custom-sans"
                                delay={50}
                                animateBy="words"
                            />
                            <BlurText
                                text="Some work done."
                                className="text-[32px] sm:text-[48px] md:text-[64px] lg:text-[80px] xl:text-[90px] font-emphasis italic font-normal leading-[1.15] tracking-[-0.04em]"
                                delay={50}
                                animateBy="words"
                            />
                        </div>
                    </h2>
                </div>

                {/* Social Media Icons */}
                <div className="flex justify-center items-center gap-6 md:gap-8 lg:gap-12 pb-20 md:pb-24 lg:pb-28">
                    <SocialLinksButton
                        onClick={() => window.open('https://www.instagram.com/mindak.studio/', '_blank')}
                        className="bg-black hover:bg-white p-4 md:p-5 lg:p-6 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 group"
                        aria-label="Instagram"
                    >
                        <Instagram className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-white group-hover:text-black transition-colors duration-200" strokeWidth={1.5} />
                    </SocialLinksButton>
                    <SocialLinksButton
                        onClick={() => window.open('https://web.facebook.com/mindakstudio/', '_blank')}
                        className="bg-black hover:bg-white p-4 md:p-5 lg:p-6 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 group"
                        aria-label="Facebook"
                    >
                        <Facebook className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-white group-hover:text-black transition-colors duration-200" strokeWidth={1.5} />
                    </SocialLinksButton>
                    <SocialLinksButton
                        onClick={() => window.open('https://www.linkedin.com/company/mindak-agency', '_blank')}
                        className="bg-black hover:bg-white p-4 md:p-5 lg:p-6 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 group"
                        aria-label="LinkedIn"
                    >
                        <Linkedin className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-white group-hover:text-black transition-colors duration-200" strokeWidth={1.5} />
                    </SocialLinksButton>
                    <SocialLinksButton
                        onClick={() => window.open('https://wa.me/213563242561', '_blank')}
                        className="bg-black hover:bg-white p-4 md:p-5 lg:p-6 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 group"
                        aria-label="WhatsApp"
                    >
                        <FaWhatsapp className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-white group-hover:text-black transition-colors duration-200" />
                    </SocialLinksButton>
                </div>

                {/* Three Column Links Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 lg:gap-16 pb-20 md:pb-24 lg:pb-28 max-w-7xl mx-auto">
                    {/* Left Column */}
                    <div className="flex flex-col gap-3 md:gap-3.5 lg:gap-4 items-center md:items-start">
                        <Link005
                            href="#get-to-know-us"
                            className="text-[#8B8B8B] hover:text-white text-[14px] md:text-[15px] lg:text-[16px] font-medium tracking-wide font-custom-sans transition-colors duration-200"
                        >
                            Get to know Us
                        </Link005>
                        <Link005
                            href="#team-excellence"
                            className="text-[#8B8B8B] hover:text-white text-[14px] md:text-[15px] lg:text-[16px] font-medium tracking-wide font-custom-sans transition-colors duration-200"
                        >
                            Team Excellence
                        </Link005>
                        <Link005
                            href="#packages"
                            className="text-[#8B8B8B] hover:text-white text-[14px] md:text-[15px] lg:text-[16px] font-medium tracking-wide font-custom-sans transition-colors duration-200"
                        >
                            Packages
                        </Link005>
                    </div>

                    {/* Center Column - Address */}
                    <div className="flex flex-col gap-2 md:gap-2.5 lg:gap-3 items-center cursor-pointer" onClick={() => window.open('https://maps.app.goo.gl/SCA2JQJLwyUyD2yv9', '_blank')}>
                        <p className="text-[#8B8B8B] hover:text-white text-[14px] md:text-[15px] lg:text-[16px] font-medium tracking-wide font-custom-sans transition-colors duration-200">
                            Find Us Here
                        </p>
                        <p className="text-[#8B8B8B] hover:text-white text-[14px] md:text-[15px] lg:text-[16px] font-medium tracking-wide font-custom-sans transition-colors duration-200">
                            Chemin Benamara Abdelkader,
                        </p>
                        <p className="text-[#8B8B8B] hover:text-white text-[14px] md:text-[15px] lg:text-[16px] font-medium tracking-wide font-custom-sans transition-colors duration-200">
                            El Achour 16182
                        </p>
                    </div>

                    {/* Right Column */}
                    <div className="flex flex-col gap-3 md:gap-3.5 lg:gap-4 items-center md:items-end">
                        <Link005
                            href="#contact"
                            className="text-[#8B8B8B] hover:text-white text-[14px] md:text-[15px] lg:text-[16px] font-medium tracking-wide font-custom-sans transition-colors duration-200"
                        >
                            Contact Us
                        </Link005>
                        <Link005
                            href="#services"
                            className="text-[#8B8B8B] hover:text-white text-[14px] md:text-[15px] lg:text-[16px] font-medium tracking-wide font-custom-sans transition-colors duration-200"
                        >
                            Services
                        </Link005>
                        <Link005
                            href="#careers"
                            className="text-[#8B8B8B] hover:text-white text-[14px] md:text-[15px] lg:text-[16px] font-medium tracking-wide font-custom-sans transition-colors duration-200"
                        >
                            Careers
                        </Link005>
                    </div>
                </div>
            </div>

            {/* Large Bottom Text - Infinite Scroll */}
            <div ref={scrollContainerRef} className="relative overflow-hidden pb-0 -mt-4 md:mt-0">
                <div
                    ref={scrollTextRef}
                    className="text-white font-medium tracking-[-0.04em] leading-none select-none pointer-events-none flex w-fit"
                    style={{
                        fontSize: 'clamp(120px, 20vw, 280px)',
                        marginBottom: '-40px',
                        willChange: 'transform'
                    }}>
                    {/* Repeated 4 times for seamless looping */}
                    {[...Array(4)].map((_, i) => (
                        <p key={i} className="whitespace-nowrap font-custom-sans opacity-100 px-8">
                            Partner up with Mindak
                        </p>
                    ))}
                </div>
            </div>
        </footer>
    );
}
