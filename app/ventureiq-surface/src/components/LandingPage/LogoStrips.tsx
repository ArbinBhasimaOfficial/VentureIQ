"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useTranslation } from "@/context/languageContext"; // Import Global Translator

export default function LogoStrips() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  // Connect the translation engine hook
  const { t } = useTranslation();

  const baseLogos = [
    "Vantone",
    "Northwind",
    "Quantia",
    "Helix",
    "Meridian",
    "Solstice",
    "Aperture",
  ];

  // Triple the array elements to ensure absolute seamless visual coverage
  const duplicatedLogos = [...baseLogos, ...baseLogos, ...baseLogos];

  useGSAP(
    () => {
      if (!trackRef.current) return;

      // Calculate translation boundary based on exactly one set of logos
      const totalWidth = trackRef.current.scrollWidth;
      const singleSetWidth = totalWidth / 3;

      // Premium linear animation looping routine
      tweenRef.current = gsap.to(trackRef.current, {
        x: -singleSetWidth,
        duration: 25, // Control horizontal velocity speed (higher = slower)
        repeat: -1,
        ease: "none",
        modifiers: {
          // Creates a perfect mathematical reset boundary loop
          x: gsap.utils.unitize((x) => parseFloat(x) % singleSetWidth),
        },
      });
    },
    { scope: containerRef },
  );

  // Interactive Playback Event States
  const handleMouseEnter = () => {
    if (tweenRef.current) {
      gsap.to(tweenRef.current, {
        timeScale: 0,
        duration: 0.4,
        ease: "power1.out",
      });
    }
  };

  const handleMouseLeave = () => {
    if (tweenRef.current) {
      gsap.to(tweenRef.current, {
        timeScale: 1,
        duration: 0.4,
        ease: "power1.out",
      });
    }
  };

  return (
    <section
      ref={containerRef}
      className="py-10 bg-white border-b border-zinc-100 overflow-hidden w-full"
      id="brands"
    >
      <div className="max-w-7xl mx-auto px-4 text-center">
        {/* Dynamic translation mapping applied directly here */}
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-8">
          {t("logoStripsHeading")}
        </p>
      </div>

      {/* Outer Viewport Container Mask */}
      <div
        className="w-full relative overflow-hidden select-none"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Ambient Visual Mask Gradients Over Left and Right Corners */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-linear-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-linear-to-l from-white to-transparent z-10 pointer-events-none" />

        {/* Moving Flex Container Strip Layout */}
        <div
          ref={trackRef}
          className="flex items-center gap-16 md:gap-24 w-max text-zinc-400 font-semibold text-sm tracking-wide will-change-transform py-2 cursor-pointer"
        >
          {duplicatedLogos.map((logo, index) => (
            <span
              key={`${logo}-${index}`}
              className="hover:text-zinc-900 transition-colors duration-200 block whitespace-nowrap text-base tracking-normal font-bold"
            >
              {logo}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
