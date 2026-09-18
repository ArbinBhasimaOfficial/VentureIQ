"use client";

import { ChevronDown } from "lucide-react";
import { useTranslation } from "../../context/languageContext"; // Adjust directory path if necessary

export default function CTA() {
  // Connect the translation engine hook
  const { t } = useTranslation();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      <div className="bg-[#030712] rounded-2xl overflow-hidden relative p-8 md:p-12 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-8">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#22d3ee_1px,transparent_1px)] bg-size-[20px_20px]"></div>

        <div className="relative z-10 max-w-xl">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">{t("ctaHeading")}</h2>
          <p className="text-slate-400 text-sm leading-relaxed">{t("ctaDescription")}</p>
        </div>

        {/* <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <button className="bg-cyan-400 text-zinc-950 border border-transparent font-bold px-6 py-3.5 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 hover:bg-zinc-950 hover:text-cyan-400 hover:border-cyan-400 active:scale-95 shadow-lg shadow-cyan-500/10 whitespace-nowrap">
            {t("ctaGetInTouch")} <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button className="bg-transparent text-white border border-slate-900 hover:bg-slate-800 font-semibold px-5 py-3 rounded text-xs transition whitespace-nowrap">
            {t("ctaOurExpert")}
          </button>
        </div> */}
      </div>
    </section>
  );
}
