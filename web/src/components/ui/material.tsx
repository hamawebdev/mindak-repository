"use client";

import React from "react";
import Image from "next/image";
import BlurText from "@/components/ui/blur-text";

const equipment = [
  {
    title: "RØDECaster Pro II",
    src: "/Studio/material/material2.png",
  },
  {
    title: "Sony FX3",
    src: "/Studio/material/material1.png",
  },
  {
    title: "RØDECaster Video S",
    src: "/Studio/material/material3.png",
  },
  {
    title: "Amaran Set",
    src: "/Studio/material/material4.png",
  },
  {
    title: "RØDE PodMic",
    src: "/Studio/material/material5.png",
  },
];

const MaterialSection = () => {
  return (
    <section id="equipments" className="relative w-full bg-black py-24 md:py-32 px-6 flex flex-col items-center">
      {/* Headline */}
      <div className="text-center mb-20 md:mb-32">
        <h2 className="text-[40px] md:text-[56px] lg:text-[72px] font-medium text-white leading-[0.95] tracking-tighter flex flex-col items-center gap-2">
          <BlurText
            text="Notre"
            className="font-custom-sans text-[40px] md:text-[56px] lg:text-[72px] font-medium text-white leading-[0.95] tracking-tighter"
            delay={50}
            animateBy="letters"
          />
          <BlurText
            text="Matériel"
            className="font-emphasis text-[40px] md:text-[56px] lg:text-[72px] font-bold text-white leading-[0.95] tracking-tighter"
            delay={50}
            animateBy="letters"
          />
        </h2>
      </div>

      {/* Grid Container */}
      <div className="w-full max-w-[1400px] mx-auto flex flex-col gap-20 md:gap-32">
        {/* Top Row - 3 items */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 items-end justify-items-center">
          {equipment.slice(0, 3).map((item, i) => (
            <div key={`top-${i}`} className="flex flex-col items-center group">
              <div className="relative w-full aspect-[4/3] max-w-[500px] transition-transform duration-500 hover:scale-105 overflow-hidden">
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  className="object-cover scale-100"
                />
              </div>
              <p className="text-white text-2xl md:text-3xl mt-8 font-medium tracking-wide font-custom-sans text-center">
                {item.title}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom Row - 2 items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-32 items-end justify-center mx-auto max-w-4xl w-full">
          {equipment.slice(3, 5).map((item, i) => (
            <div key={`bottom-${i}`} className="flex flex-col items-center group">
              <div className="relative w-full aspect-[4/3] max-w-[500px] transition-transform duration-500 hover:scale-105 overflow-hidden">
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  className="object-cover scale-100"
                />
              </div>
              <p className="text-white text-2xl md:text-3xl mt-8 font-medium tracking-wide font-custom-sans text-center">
                {item.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export { MaterialSection };
