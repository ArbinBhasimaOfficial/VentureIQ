"use client";

import { memo } from "react";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";

import { useTranslation } from "@/context/languageContext";
import { LoginForm } from "../../components/loginPage/loginForm";

// Memoize the background glow element so React never re-paints it on parent updates
const AnimatedGlow = memo(function AnimatedGlow() {
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1DE4EC]/[0.03] blur-[140px]" />
  );
});

export default function LoginPage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col justify-between bg-[#030708] font-sans text-white selection:bg-[#1DE4EC]/30">
      <div className="grid grow grid-cols-1 lg:grid-cols-12">
        {/* Left Visual Column */}
        <section className="flex flex-col justify-between border-r border-white/[0.02] bg-gradient-to-b from-[#051012] to-[#030708] p-8 lg:col-span-6 lg:p-20">
          <Link href="/" className="group mt-2 flex items-center gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-cyan-400 transition-transform duration-300 group-hover:rotate-12">
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-950" />
            </span>
            <span className="text-lg font-bold tracking-tight">
              Venture<span className="text-cyan-400">IQ</span>
            </span>
          </Link>

          <div className="my-auto max-w-xl py-16 lg:py-0">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#1DE4EC]/20 bg-[#1DE4EC]/5 px-4 py-1.5 text-xs font-semibold tracking-wide text-[#1DE4EC]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#1DE4EC]" />
              {t("heroBadge")}
            </div>
            <div className="space-y-5">
              <h1 className="text-5xl font-bold tracking-tight text-white lg:text-6xl">
                {t("welcomeBack")}
              </h1>
              <h2 className="text-2xl font-semibold leading-snug tracking-tight text-[#1DE4EC] lg:text-3xl">
                {t("marketIntelligenceAwaits")}
              </h2>
              <p className="max-w-md text-base leading-relaxed text-gray-400/80">
                {t("signInDesc")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-8 border-t border-white/[0.04] pt-8">
            <div>
              <strong className="text-3xl font-extrabold tracking-tight text-[#1DE4EC] lg:text-4xl">
                12k+
              </strong>
              <div className="mt-1.5 text-xs font-medium tracking-wide text-gray-500">
                {t("statsReports")}
              </div>
            </div>
            <div>
              <strong className="text-3xl font-extrabold tracking-tight text-[#1DE4EC] lg:text-4xl">
                86
              </strong>
              <div className="mt-1.5 text-xs font-medium tracking-wide text-gray-500">
                {t("statsMarkets")}
              </div>
            </div>
            <div>
              <strong className="text-3xl font-extrabold tracking-tight text-[#1DE4EC] lg:text-4xl">
                98%
              </strong>
              <div className="mt-1.5 text-xs font-medium tracking-wide text-gray-500">
                {t("statsRetention")}
              </div>
            </div>
          </div>
        </section>

        {/* Right Form Column */}
        <section className="relative flex items-center justify-center bg-[#040809] p-6 lg:col-span-6 lg:p-12">
          <AnimatedGlow />

          <div className="relative z-10 w-full max-w-[460px] rounded-2xl border border-white/[0.04] bg-[#121719] p-8 shadow-2xl lg:p-9">
            <h3 className="mb-6 text-2xl font-bold tracking-tight text-gray-100">
              {t("loginHeading")}
            </h3>

            <div className="relative mb-7 flex gap-6 border-b border-white/[0.04] pb-4 text-sm font-semibold">
              <span className="relative pb-1 text-white">
                {t("loginTab")}
                <span className="absolute bottom-[-17px] left-0 right-0 h-[2px] bg-[#1DE4EC]" />
              </span>
              <Link
                href="/register"
                className="pb-1 text-gray-500 transition-colors hover:text-gray-300"
              >
                {t("registerTab")}
              </Link>
            </div>

            {/* Isolated Form */}
            <LoginForm />

            <div className="relative my-6 flex items-center py-2">
              <div className="grow border-t border-white/[0.04]" />
              <span className="mx-4 shrink text-[10px] font-bold tracking-widest text-gray-500">
                {t("orContinueWith")}
              </span>
              <div className="grow border-t border-white/[0.04]" />
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <button
                type="button"
                className="rounded-xl border border-white/[0.04] bg-[#0a0f11] py-3 text-sm font-semibold text-gray-300 transition-all hover:bg-white/[0.02] hover:text-white"
              >
                Google
              </button>
              <button
                type="button"
                className="rounded-xl border border-white/[0.04] bg-[#0a0f11] py-3 text-sm font-semibold text-gray-300 transition-all hover:bg-white/[0.02] hover:text-white"
              >
                LinkedIn
              </button>
            </div>

            <div className="mt-7 text-center text-xs font-medium text-gray-500">
              {t("dontHaveAccount")}{" "}
              <Link
                href="/register"
                className="font-semibold text-[#1DE4EC] transition-colors hover:text-[#2ff4fc]"
              >
                {t("startFreeTrial")}
              </Link>
            </div>
          </div>
        </section>
      </div>

      <footer className="flex w-full flex-col items-center justify-between gap-4 border-t border-white/[0.02] bg-[#020506] px-6 py-6 text-xs font-medium text-gray-500 sm:flex-row lg:px-20">
        <div className="flex flex-wrap justify-center gap-6">
          <a href="#privacy" className="transition-colors hover:text-gray-300">
            {t("footerPrivacy")}
          </a>
          <a href="#terms" className="transition-colors hover:text-gray-300">
            {t("footerTerms")}
          </a>
          <a href="#cookies" className="transition-colors hover:text-gray-300">
            {t("footerCookies")}
          </a>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5 font-semibold text-emerald-500/80">
            <ShieldCheck className="h-4 w-4 text-emerald-500" aria-hidden="true" />
            <span>{t("secureAccess")}</span>
          </div>
          <span className="text-gray-600">{t("footerRights")}</span>
        </div>
      </footer>
    </div>
  );
}
