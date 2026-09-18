"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { dictionary } from ".././data/dictionary";

type LanguageType = keyof typeof dictionary;

interface LanguageContextProps {
  currentLang: LanguageType;
  setLanguage: (lang: LanguageType) => void;
  t: (key: keyof (typeof dictionary)["en"]) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

const getInitialLanguage = (): LanguageType => {
  if (typeof window === "undefined") return "en";

  try {
    const savedLang = localStorage.getItem("nexus-core-lang") as LanguageType;
    if (savedLang && dictionary[savedLang]) {
      return savedLang;
    }
  } catch (error) {
    console.error("Failed to read from localStorage:", error);
  }

  return "en";
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLang, setCurrentLang] = useState<LanguageType>(getInitialLanguage);

  useEffect(() => {
    document.documentElement.lang = currentLang;
  }, [currentLang]);

  const setLanguage = (lang: LanguageType) => {
    setCurrentLang(lang);
    localStorage.setItem("nexus-core-lang", lang);
  };

  // 3. Robust, ESLint-compliant Translation Resolver
  const t = (key: keyof (typeof dictionary)["en"]): string => {
    // Cast objects safely to satisfy compiler & linters without using 'any'
    const targetDict = dictionary[currentLang] as Record<string, unknown>;
    const fallbackDict = dictionary["en"] as Record<string, unknown>;

    const resolvedValue = targetDict[key] ?? fallbackDict[key];

    // If the value is a nested translation object, serialize it safely or return empty string
    if (typeof resolvedValue === "object" && resolvedValue !== null) {
      return JSON.stringify(resolvedValue);
    }

    return String(resolvedValue ?? "");
  };

  return (
    <LanguageContext.Provider value={{ currentLang, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useTranslation must be used within a LanguageProvider");
  return context;
};
