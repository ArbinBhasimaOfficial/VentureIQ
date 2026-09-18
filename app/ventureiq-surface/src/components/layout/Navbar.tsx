"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import Link from "next/link";

import { Check, ChevronDown, Globe, Menu, Moon, Sun, X } from "lucide-react";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { useTheme } from "@/components/providers/theme-providers";
import { useTranslation } from "@/context/languageContext";
import { dictionary } from "@/data/dictionary";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ne", label: "नेपाली" },
  { code: "ja", label: "日本語" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
] as const;

type LanguageCode = keyof typeof dictionary;

const NAV_ITEMS = [
  { labelKey: "platform", href: "#platform" },
  { labelKey: "marketIntelligence", href: "#intelligence" },
  { labelKey: "reports", href: "#reports" },
  { labelKey: "industries", href: "#industries" },
  { labelKey: "resources", href: "#resources" },
] as const;

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const { currentLang, setLanguage, t } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === "dark";

  const handleLanguageChange = (language: LanguageCode) => {
    setLanguage(language);
    setIsLanguageOpen(false);
  };

  const handleThemeChange = () => {
    toggleTheme();
  };

  const closeMenus = () => {
    setIsLanguageOpen(false);
    setIsMobileMenuOpen(false);
  };

  /*
   * Close dropdowns when clicking outside or pressing Escape.
   */
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLanguageOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenus();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  /*
   * Navbar entrance animation.
   */
  useGSAP(
    () => {
      if (!navRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      gsap.from(navRef.current, {
        y: -16,
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
      });
    },
    {
      scope: navRef,
    },
  );

  return (
    <nav
      ref={navRef}
      aria-label="Main navigation"
      className="sticky top-0 z-50 border-b border-zinc-200/10 bg-white/90 text-zinc-950 backdrop-blur-md dark:border-zinc-900 dark:bg-zinc-950/90 dark:text-white"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            onClick={closeMenus}
            aria-label="VentureIQ home"
            className="group flex items-center gap-2.5"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-cyan-400 transition-transform duration-300 group-hover:rotate-12">
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-950" />
            </span>

            <span className="text-lg font-bold tracking-tight">
              Venture<span className="text-cyan-400">IQ</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center space-x-7 text-sm font-medium text-zinc-500 dark:text-zinc-400 md:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex h-16 items-center transition-colors hover:text-cyan-400"
              >
                {t(item.labelKey)}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-4 md:flex">
            {/* Theme Toggle */}
            {mounted ? (
              <button
                type="button"
                onClick={handleThemeChange}
                aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
                title={isDark ? "Switch to light theme" : "Switch to dark theme"}
                className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-cyan-400 dark:hover:bg-zinc-900"
              >
                {isDark ? (
                  <Sun className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Moon className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            ) : (
              <span className="h-8 w-8" aria-hidden="true" />
            )}

            {/* Language Selector */}
            <div ref={dropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setIsLanguageOpen((previous) => !previous)}
                aria-expanded={isLanguageOpen}
                aria-haspopup="menu"
                aria-controls="language-menu"
                className="flex items-center gap-1.5 rounded-lg p-2 text-xs font-medium uppercase tracking-wider text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-cyan-400 dark:hover:bg-zinc-900"
              >
                <Globe className="h-4 w-4 text-cyan-400" aria-hidden="true" />

                <span>{currentLang}</span>

                <ChevronDown
                  className={`h-3 w-3 transition-transform ${isLanguageOpen ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </button>

              {isLanguageOpen && (
                <div
                  id="language-menu"
                  role="menu"
                  aria-label="Choose language"
                  className="absolute right-0 mt-2 w-36 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
                >
                  {LANGUAGES.map((language) => {
                    const isSelected = currentLang === language.code;

                    return (
                      <button
                        key={language.code}
                        type="button"
                        role="menuitemradio"
                        aria-checked={isSelected}
                        onClick={() => handleLanguageChange(language.code)}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold transition-colors ${
                          isSelected
                            ? "bg-cyan-500/10 text-cyan-400"
                            : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950 dark:hover:bg-zinc-900 dark:hover:text-white"
                        }`}
                      >
                        <span>{language.label}</span>

                        {isSelected && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Login */}
            <Link
              href="/login"
              className="text-sm font-medium text-zinc-500 transition-colors hover:text-cyan-400"
            >
              {t("login")}
            </Link>

            {/* Register */}
            <Link
              href="/register"
              className="text-sm font-medium text-zinc-500 transition-colors hover:text-cyan-400"
            >
              {t("register")}
            </Link>

            {/* Get In Touch */}
            <Link
              href="/contact"
              className="rounded-xl bg-cyan-400 px-5 py-3 text-xs font-bold uppercase tracking-widest text-zinc-950 shadow-lg shadow-cyan-500/10 transition-all hover:bg-zinc-950 hover:text-cyan-400 hover:ring-1 hover:ring-cyan-400 active:scale-95 dark:hover:bg-zinc-900"
            >
              {t("getInTouch")}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((previous) => !previous)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
            className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-cyan-400 dark:hover:bg-zinc-900 md:hidden"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div
            id="mobile-navigation"
            className="border-t border-zinc-200/10 py-5 dark:border-zinc-900 md:hidden"
          >
            <div className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenus}
                  className="rounded-lg px-3 py-3 text-sm font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-cyan-400 dark:hover:bg-zinc-900"
                >
                  {t(item.labelKey)}
                </Link>
              ))}

              <div className="my-3 h-px bg-zinc-200 dark:bg-zinc-900" />

              {/* Login */}
              <Link
                href="/login"
                onClick={closeMenus}
                className="rounded-lg px-3 py-3 text-sm font-medium text-zinc-500 hover:text-cyan-400"
              >
                {t("login")}
              </Link>

              {/* Register */}
              <Link
                href="/register"
                onClick={closeMenus}
                className="rounded-lg px-3 py-3 text-sm font-medium text-zinc-500 hover:text-cyan-400"
              >
                {t("register")}
              </Link>

              {/* Get In Touch */}
              <Link
                href="/contact"
                onClick={closeMenus}
                className="mt-2 rounded-xl bg-cyan-400 px-5 py-3 text-center text-xs font-bold uppercase tracking-widest text-zinc-950"
              >
                {t("getInTouch")}
              </Link>

              {/* Mobile Theme Toggle */}
              {mounted && (
                <button
                  type="button"
                  onClick={handleThemeChange}
                  aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
                  className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-zinc-200 px-4 py-3 text-xs font-semibold text-zinc-500 dark:border-zinc-800"
                >
                  {isDark ? (
                    <Sun className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Moon className="h-4 w-4" aria-hidden="true" />
                  )}

                  {isDark ? "Light theme" : "Dark theme"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
