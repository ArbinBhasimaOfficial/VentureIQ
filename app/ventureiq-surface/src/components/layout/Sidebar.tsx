"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Factory, LayoutDashboard, LineChart, FileStack, Settings, Radio } from "lucide-react";

const NAV_ITEMS = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Markets", href: "/dashboard/markets", icon: LineChart },
  { label: "Industries", href: "/dashboard/industries", icon: Factory },
  { label: "Reports", href: "/dashboard/reports", icon: FileStack },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[248px] shrink-0 min-h-screen bg-[#050a0b] border-r border-white/[0.04] flex flex-col relative">
      {/* Faint vertical signal line running the height of the rail */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-[#1DE4EC]/20 via-white/[0.03] to-transparent" />

      {/* Brand mark */}
      <div className="px-6 pt-7 pb-6 flex items-center gap-2.5">
        <div className="w-6 h-6 bg-[#1DE4EC] rounded-md flex items-center justify-center">
          <div className="w-2.5 h-2.5 bg-[#050a0b] rounded-full" />
        </div>
        <span className="font-bold text-[15px] tracking-tight text-gray-100">
          Venture<span className="text-[#1DE4EC]">IQ</span>
        </span>
      </div>

      {/* Live status readout, sets the "console" tone before any nav is shown */}
      <div className="mx-6 mb-6 px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center gap-2">
        <Radio className="w-3.5 h-3.5 text-[#1DE4EC] animate-pulse" />
        <span className="text-[11px] font-medium text-gray-400">
          Cluster <span className="text-emerald-400">online</span>
        </span>
      </div>

      {/* Navigation stack */}
      <nav className="flex-1 px-3 space-y-0.5">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive =
            href === "/dashboard" ? pathname === "/dashboard" : pathname?.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition-colors duration-150 ${
                isActive ? "text-gray-100" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {/* Active-route signal indicator, replaces a filled pill background */}
              <span
                className={`absolute left-[-13px] top-1/2 -translate-y-1/2 h-4 w-[2px] rounded-full transition-all duration-200 ${
                  isActive ? "bg-[#1DE4EC] shadow-[0_0_8px_rgba(29,228,236,0.6)]" : "bg-transparent"
                }`}
              />
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors duration-150 ${
                  isActive ? "text-[#1DE4EC]" : "text-gray-600 group-hover:text-gray-400"
                }`}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer readout, mirrors the diagnostics-panel voice from the dashboard body */}
      <div className="px-6 py-5 border-t border-white/[0.03]">
        <p className="text-[10px] font-mono text-gray-600 tracking-tight">
          build 4.12.0 · node-cluster-3a
        </p>
      </div>
    </aside>
  );
}
