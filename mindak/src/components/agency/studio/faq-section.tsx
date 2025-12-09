"use client";

import React, { useState } from "react";
import { ChevronRight } from "lucide-react";
import BlurText from "@/components/ui/blur-text";

interface FAQItem {
    id: number;
    question: string;
    answer: string;
}

const faqData: FAQItem[] = [
    {
        id: 1,
        question: "Où est situé votre studio à Alger ?",
        answer: "Notre studio se trouve à El Achour – Alger. L'adresse complète et l'itinéraire Google Maps s'affichent directement lors de la réservation."
    },
    {
        id: 2,
        question: "Quels services propose votre studio à Alger ?",
        answer: "Nous proposons des services de podcast professionnel, incluant un setup complet (caméras cinéma, éclairage, son), une assistance technique sur place et des options de post-production."
    },
    {
        id: 3,
        question: "Offrez-vous un service d'accompagnement sur place ?",
        answer: "Oui, un membre de notre équipe est toujours présent pour vous assister, gérer le matériel et assurer une expérience fluide durant toute la session."
    },
    {
        id: 4,
        question: "Puis-je visiter votre studio avant la réservation ?",
        answer: "Bien sûr. Vous pouvez passer découvrir le studio à tout moment dans nos horaires, ou nous contacter pour convenir d'un créneau rapide."
    },
    {
        id: 5,
        question: "Quels sont les horaires de service du studio ?",
        answer: "Le studio est ouvert du dimanche au jeudi, de 09h00 à 17h00."
    }
];

export function FAQSection() {
    const [expandedId, setExpandedId] = useState<number | null>(5);

    const toggleFAQ = (id: number) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <section id="faq" className="w-full bg-black py-20 md:py-32">
            <div className="w-full px-0">
                {/* Header */}
                <div className="text-center mb-16 md:mb-20 px-6">
                    <h2 className="text-5xl md:text-7xl lg:text-8xl font-medium text-white leading-tight flex flex-col items-center gap-2">
                        <BlurText
                            text="Frequently"
                            className="font-custom-sans text-5xl md:text-7xl lg:text-8xl font-medium text-white leading-tight tracking-[-0.04em]"
                            delay={50}
                            animateBy="letters"
                        />
                        <BlurText
                            text="Asked questions."
                            className="italic-riccione text-4xl md:text-7xl lg:text-8xl font-medium text-white leading-tight tracking-[-0.04em]"
                            delay={50}
                            animateBy="words"
                        />
                    </h2>
                </div>

                {/* FAQ Items */}
                <div className="w-full">
                    {faqData.map((item, index) => {
                        const isExpanded = expandedId === item.id;
                        const paddedNumber = item.id.toString().padStart(2, '0');

                        return (
                            <div
                                key={item.id}
                                className={`relative transition-all duration-500 ease-in-out ${index !== 0 ? 'border-t border-white/20' : ''
                                    }`}
                                style={{
                                    backgroundColor: isExpanded ? '#9EFF00' : '#000000',
                                    minHeight: 'clamp(120px, 15vh, 160px)'
                                }}
                            >
                                <button
                                    onClick={() => toggleFAQ(item.id)}
                                    className="w-full text-left transition-all duration-300"
                                >
                                    <div className="flex items-center justify-between pl-6 pr-0 py-4 md:py-6 lg:py-8">
                                        {/* Number and Question */}
                                        <div className="flex items-center gap-6 md:gap-8 lg:gap-12 flex-1">
                                            {/* Number */}
                                            <span
                                                className={`font-bold leading-none transition-colors duration-300 ${isExpanded ? 'text-black' : 'text-white'
                                                    }`}
                                                style={{
                                                    fontSize: 'clamp(80px, 12vw, 180px)',
                                                    fontFamily: "'Helvetica Neue Local', 'Helvetica Neue', sans-serif",
                                                    fontWeight: 500,
                                                    letterSpacing: '-0.04em'
                                                }}
                                            >
                                                {paddedNumber}
                                            </span>

                                            {/* Question */}
                                            <h3
                                                className={`font-medium transition-colors duration-300 ${isExpanded ? 'text-black' : 'text-white'
                                                    }`}
                                                style={{
                                                    fontSize: 'clamp(24px, 4vw, 56px)',
                                                    fontFamily: "'Helvetica Neue Local', 'Helvetica Neue', sans-serif",
                                                    fontWeight: 500,
                                                    letterSpacing: '-0.04em',
                                                    lineHeight: '1.1'
                                                }}
                                            >
                                                {item.question}
                                            </h3>
                                        </div>

                                        {/* Arrow Icon */}
                                        <div
                                            className={`flex-shrink-0 rounded-full border-2 transition-all duration-300 ${isExpanded
                                                ? 'border-black rotate-90'
                                                : 'border-white rotate-0'
                                                }`}
                                            style={{
                                                width: 'clamp(50px, 6vw, 70px)',
                                                height: 'clamp(50px, 6vw, 70px)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <ChevronRight
                                                className={`transition-colors duration-300 ${isExpanded ? 'text-black' : 'text-white'
                                                    }`}
                                                style={{
                                                    width: 'clamp(24px, 3vw, 32px)',
                                                    height: 'clamp(24px, 3vw, 32px)',
                                                    strokeWidth: 2
                                                }}
                                            />
                                        </div>
                                    </div>
                                </button>

                                {/* Answer - Expandable */}
                                <div
                                    className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                        }`}
                                >
                                    <div className="px-6 md:px-12 lg:px-16 pb-10 md:pb-12 lg:pb-14">
                                        <p
                                            className="text-black leading-relaxed"
                                            style={{
                                                fontSize: 'clamp(14px, 1.8vw, 18px)',
                                                fontFamily: "'Helvetica Neue Local', 'Helvetica Neue', sans-serif",
                                                fontWeight: 500,
                                                marginLeft: 'calc(clamp(80px, 12vw, 180px) + clamp(24px, 2rem, 48px))',
                                                maxWidth: '960px',
                                                lineHeight: '1.6'
                                            }}
                                        >
                                            {item.answer}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
