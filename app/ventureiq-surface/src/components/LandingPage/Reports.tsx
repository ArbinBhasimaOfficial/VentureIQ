"use client";

import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useTranslation } from "@/context/languageContext"; // Import Global Translator
import { dictionary } from "@/data/dictionary";

interface ReportItem {
  id: string;
  badgeKey: keyof (typeof dictionary)["en"]; // Explicitly typed to dictionary keys
  badgeColor: string;
  titleKey: keyof (typeof dictionary)["en"]; // Explicitly typed to dictionary keys
  descKey: keyof (typeof dictionary)["en"]; // Explicitly typed to dictionary keys
  bgContent: "binary" | "bars" | "pulse";
}

export default function Reports() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsMapRef = useRef<Map<string, HTMLDivElement>>(new Map());

  // Connect the translation engine hook
  const { t } = useTranslation();

  const setCardRef = (el: HTMLDivElement | null, key: string) => {
    if (el) {
      cardsMapRef.current.set(key, el);
    } else {
      cardsMapRef.current.delete(key);
    }
  };

  useGSAP(
    () => {
      const validCards = Array.from(cardsMapRef.current.values()).filter(Boolean);

      // 1. Reveal Cascade Animation on Entrance
      gsap.from(".animate-header-element", {
        opacity: 0,
        y: 24,
        duration: 0.7,
        stagger: 0.12,
        ease: "power2.out",
      });

      if (validCards.length > 0) {
        gsap.from(validCards, {
          opacity: 0,
          y: 35,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          delay: 0.15,
        });
      }
    },
    { scope: containerRef },
  );

  // 2. Interactive Card Lifting & Inner Graphical Micro-movements
  const handleMouseEnter = (key: string) => {
    const targetCard = cardsMapRef.current.get(key);
    if (!targetCard) return;

    // Card lifting physics
    gsap.to(targetCard, {
      y: -6,
      scale: 1.01,
      duration: 0.35,
      ease: "power2.out",
      overwrite: "auto",
      boxShadow: "0 20px 25px -5px rgba(0,0,0,0.06), 0 10px 10px -5px rgba(0,0,0,0.02)",
    });

    // Targeted micro-animating the individual graphic components inside the card
    const assetElement = targetCard.querySelector(".data-asset");
    if (assetElement) {
      gsap.to(assetElement, {
        scale: 1.08,
        opacity: 0.7,
        duration: 0.4,
        ease: "power1.out",
      });
    }
  };

  const handleMouseLeave = (key: string) => {
    const targetCard = cardsMapRef.current.get(key);
    if (!targetCard) return;

    gsap.to(targetCard, {
      y: 0,
      scale: 1,
      duration: 0.35,
      ease: "power2.out",
      overwrite: "auto",
      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.01)",
    });

    const assetElement = targetCard.querySelector(".data-asset");
    if (assetElement) {
      gsap.to(assetElement, {
        scale: 1,
        opacity: 0.4,
        duration: 0.4,
        ease: "power1.out",
      });
    }
  };

  const reports: ReportItem[] = [
    {
      id: "predictions-2026",
      badgeKey: "badgeFinancial",
      badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
      titleKey: "reportPredTitle",
      descKey: "reportPredDesc",
      bgContent: "binary",
    },
    {
      id: "ai-whitespace",
      badgeKey: "badgeTech",
      badgeColor: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
      titleKey: "reportWhiteTitle",
      descKey: "reportWhiteDesc",
      bgContent: "bars",
    },
    {
      id: "mega-trends",
      badgeKey: "badgeRetail",
      badgeColor: "bg-sky-500/15 text-sky-400 border-sky-500/20",
      titleKey: "reportTrendsTitle",
      descKey: "reportTrendsDesc",
      bgContent: "pulse",
    },
  ];

  return (
    <section ref={containerRef} className="py-24 bg-zinc-50 overflow-hidden" id="resources">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-14">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-cyan-600 block animate-header-element">
              {t("reportsSubHeader")}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 animate-header-element">
              {t("reportsMainHeader")}
            </h2>
          </div>
          <button className="animate-header-element bg-white border border-zinc-200 text-zinc-600 font-bold px-5 py-2.5 rounded-xl text-xs hover:bg-zinc-50 hover:text-zinc-900 transition-colors shadow-sm whitespace-nowrap">
            {t("reportsBrowseAll")}
          </button>
        </div>

        {/* Grid Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {reports.map((report) => (
            <div
              key={report.id}
              ref={(el) => setCardRef(el, report.id)}
              onMouseEnter={() => handleMouseEnter(report.id)}
              onMouseLeave={() => handleMouseLeave(report.id)}
              style={{ position: "relative" }}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-zinc-100 flex flex-col justify-between min-h-115 will-change-transform"
            >
              {/* Top Graphic Header Area */}
              <div className="h-48 bg-zinc-950 relative flex items-center justify-center overflow-hidden">
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[16px_16px]" />

                {/* Render Dynamic Background Graphic Artifacts */}
                <div className="data-asset opacity-40 select-none will-change-transform pointer-events-none w-full flex justify-center items-center">
                  {report.bgContent === "binary" && (
                    <div className="font-mono text-[9px] p-6 text-center leading-relaxed text-emerald-500/60 tracking-widest break-all max-w-60">
                      01010100 01010010 01000101 01001110 01000100 01010011 11010011 00101110
                    </div>
                  )}

                  {report.bgContent === "bars" && (
                    <div className="flex items-end gap-1.5 h-12">
                      {[40, 15, 65, 30, 85, 45, 20, 70, 50].map((h, i) => (
                        <div
                          key={i}
                          style={{ height: `${h}%` }}
                          className="w-1 bg-cyan-500/50 rounded-t-sm"
                        />
                      ))}
                    </div>
                  )}

                  {report.bgContent === "pulse" && (
                    <div className="relative flex items-center justify-center w-20 h-20">
                      <div className="absolute w-full h-full rounded-full border border-sky-500/40 animate-ping opacity-60" />
                      <div className="w-4 h-4 rounded-full bg-sky-500/30 border border-sky-400" />
                    </div>
                  )}
                </div>

                {/* Floating Badge (Dynamic Text Translation) */}
                <span
                  className={`absolute top-4 left-4 text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wide border backdrop-blur-md ${report.badgeColor}`}
                >
                  {t(report.badgeKey)}
                </span>
              </div>

              {/* Lower Card Text Content Area */}
              <div className="p-8 flex flex-col grow justify-between bg-white">
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-zinc-900 tracking-tight line-clamp-2 leading-snug">
                    {t(report.titleKey)}
                  </h3>
                  <p className="text-zinc-500 text-sm leading-relaxed line-clamp-3">
                    {t(report.descKey)}
                  </p>
                </div>

                <div className="pt-6">
                  <a
                    href="#download"
                    className="text-cyan-600 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 hover:text-cyan-700 transition-colors group"
                  >
                    {t("reportsDownloadAction")}
                    <ArrowUpRight className="w-3.5 h-3.5 transform transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
