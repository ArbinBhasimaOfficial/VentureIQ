"use client";

import { useTranslation } from "@/context/languageContext"; // Adjust directory path if necessary
import { dictionary } from "@/data/dictionary";

interface NavigationLink {
  labelKey: keyof (typeof dictionary)["en"];
  href: string;
}

interface NavigationSection {
  titleKey: keyof (typeof dictionary)["en"];
  links: NavigationLink[];
}

export default function Footer() {
  // Connect the translation engine hook
  const { t } = useTranslation();

  // Pure SVG paths to guarantee absolute compile safety and zero dependencies
  const socialLinks = [
    {
      label: "LinkedIn",
      href: "#linkedin",
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      ),
    },
    {
      label: "Twitter",
      href: "#twitter",
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      label: "GitHub",
      href: "#github",
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      ),
    },
    {
      label: "Instagram",
      href: "#instagram",
      icon: (
        <svg
          className="w-4 h-4 stroke-current fill-none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
        </svg>
      ),
    },
  ];

  const navigationSections: NavigationSection[] = [
    {
      titleKey: "navSolutions",
      links: [
        { labelKey: "labelOnDemand", href: "#ondemand" },
        { labelKey: "labelConsulting", href: "#consulting" },
        { labelKey: "labelIntegrations", href: "#integrations" },
        { labelKey: "labelExperts", href: "#experts" },
      ],
    },
    {
      titleKey: "navCompany",
      links: [
        { labelKey: "labelAbout", href: "#about" },
        { labelKey: "labelCareers", href: "#careers" },
        { labelKey: "labelPress", href: "#press" },
        { labelKey: "labelContact", href: "#contact" },
      ],
    },
    {
      titleKey: "navResources",
      links: [
        { labelKey: "labelArticles", href: "#articles" },
        { labelKey: "labelDownloads", href: "#downloads" },
        { labelKey: "labelEvents", href: "#events" },
        { labelKey: "labelPodcasts", href: "#podcasts" },
      ],
    },
  ];

  return (
    <footer className="bg-zinc-950 text-zinc-400 text-xs py-16 border-t border-zinc-900 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Grid Area */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-14">
          {/* Brand Pillar Column */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2.5 group cursor-pointer w-fit">
              <div className="w-5 h-5 bg-cyan-400 rounded-md flex items-center justify-center transition-transform duration-300 group-hover:rotate-12">
                <div className="w-2 h-2 bg-zinc-950 rounded-full" />
              </div>
              <span className="font-bold text-sm tracking-tight text-white">
                Venture<span className="text-cyan-400">IQ</span>
              </span>
            </div>

            <p className="text-zinc-500 max-w-xs leading-relaxed font-medium">
              {t("footerBrandDesc")}
            </p>

            {/* Dynamic Social Vector Links */}
            <div className="flex gap-2.5 pt-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800/60 flex items-center justify-center text-zinc-400 transition-all duration-200 hover:bg-zinc-800 hover:text-cyan-400 hover:border-cyan-500/30 hover:-translate-y-0.5 active:scale-95"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Mapped Directory Links */}
          {navigationSections.map((section) => (
            <div key={section.titleKey}>
              <h4 className="text-white font-bold mb-4 uppercase tracking-widest text-[10px]">
                {t(section.titleKey)}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.labelKey}>
                    <a
                      href={link.href}
                      className="hover:text-white transition-colors duration-200 font-medium text-zinc-400/90"
                    >
                      {t(link.labelKey)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Metadata Ribbon */}
        <div className="pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-600 font-medium">
          <p>{t("footerRights")}</p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <a href="#privacy" className="hover:text-zinc-400 transition-colors duration-200">
              {t("footerPrivacy")}
            </a>
            <a href="#terms" className="hover:text-zinc-400 transition-colors duration-200">
              {t("footerTerms")}
            </a>
            <a href="#cookies" className="hover:text-zinc-400 transition-colors duration-200">
              {t("footerCookies")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
