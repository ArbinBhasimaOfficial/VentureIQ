"use client";

import { useRef } from "react";
import { ArrowUpRight, Cpu, Compass, Database } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useTranslation } from "../../context/languageContext"; // Import Global Translator

import { dictionary } from "../../data/dictionary";
interface SolutionItem {
  id: string;
  icon: React.ReactNode;
  titleKey: keyof (typeof dictionary)["en"]; // Explicitly bound to dictionary keys
  descKey: keyof (typeof dictionary)["en"]; // Explicitly bound to dictionary keys
}

export default function Solutions() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Connect the translation engine hook
  const { t } = useTranslation();

  // Typed Map instance to explicitly hold HTML div nodes paired to string identifiers
  const cardsMapRef = useRef<Map<string, HTMLDivElement>>(new Map());

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

      gsap.from(".animate-header", {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power3.out",
      });

      if (validCards.length > 0) {
        gsap.from(validCards, {
          opacity: 0,
          y: 40,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          delay: 0.2,
        });
      }
    },
    { scope: containerRef },
  );

  const handleMouseEnter = (key: string) => {
    const targetCard = cardsMapRef.current.get(key);
    if (!targetCard) return;

    gsap.to(targetCard, {
      y: -10,
      scale: 1.02,
      zIndex: 10,
      duration: 0.35,
      ease: "power2.out",
      overwrite: "auto",
      boxShadow: "0 25px 40px -15px rgba(0, 0, 0, 0.2)",
    });
  };

  const handleMouseLeave = (key: string) => {
    const targetCard = cardsMapRef.current.get(key);
    if (!targetCard) return;

    gsap.to(targetCard, {
      y: 0,
      scale: 1,
      zIndex: 1,
      duration: 0.35,
      ease: "power2.out",
      overwrite: "auto",
      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.02)",
    });
  };

  const solutionData: SolutionItem[] = [
    {
      id: "on-demand",
      icon: <Cpu className="w-4 h-4" />,
      titleKey: "solOnDemandTitle",
      descKey: "solOnDemandDesc",
    },
    {
      id: "consulting",
      icon: <Compass className="w-4 h-4" />,
      titleKey: "solConsultingTitle",
      descKey: "solConsultingDesc",
    },
    {
      id: "integrations",
      icon: <Database className="w-4 h-4" />,
      titleKey: "solIntegrationsTitle",
      descKey: "solIntegrationsDesc",
    },
  ];

  return (
    <section ref={containerRef} className="py-24 bg-slate-50 overflow-hidden" id="solutions">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Block */}
        <div className="mb-14 animate-header">
          <span className="text-xs font-semibold uppercase tracking-widest text-cyan-600 block mb-3">
            {t("solutionsSubHeader")}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">
            {t("solutionsMainHeader")}
          </h2>
        </div>

        {/* Grid Setup */}
        <div className="grid md:grid-cols-3 gap-6 relative">
          {solutionData.map((item) => (
            <div
              key={item.id}
              ref={(el) => setCardRef(el, item.id)}
              onMouseEnter={() => handleMouseEnter(item.id)}
              onMouseLeave={() => handleMouseLeave(item.id)}
              style={{ position: "relative" }}
              className="group bg-white border border-zinc-200/80 rounded-2xl p-8 flex flex-col justify-between min-h-75 will-change-transform transition-colors duration-300 hover:bg-zinc-950 hover:border-zinc-800"
            >
              <div>
                {/* Icon Wrapper Component */}
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center mb-6 transition-colors duration-300 group-hover:bg-cyan-500/20 group-hover:text-cyan-400">
                  {item.icon}
                </div>

                {/* Card Title */}
                <h3 className="text-zinc-900 text-xl font-bold tracking-tight mb-3 transition-colors duration-300 group-hover:text-white">
                  {t(item.titleKey)}
                </h3>

                {/* Card Description */}
                <p className="text-zinc-500 text-sm leading-relaxed transition-colors duration-300 group-hover:text-zinc-400">
                  {t(item.descKey)}
                </p>
              </div>

              {/* Action Button/Link */}
              <div className="mt-8">
                <a
                  href="#learn"
                  className="text-cyan-600 font-bold text-xs uppercase tracking-wider inline-flex items-center gap-1.5 transition-colors duration-300 group-hover:text-cyan-400"
                >
                  {t("solutionsLearnMore")}
                  <ArrowUpRight className="w-3.5 h-3.5 transform transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
