"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Home,
  Sun,
  Moon,
  Accessibility,
  LogOut,
  ChevronDown,
  Palette,
  Settings,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";

import { useTheme } from "@/components/providers/theme-providers";
import { useAuthStore } from "@/store/auth.store";

interface UserDropdownProps {
  isDashboard?: boolean;
}

const emptySubscribe = () => () => {};
function useIsHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

function getInitials(name: string) {
  const nameParts = name.trim().split(/\s+/).filter(Boolean);
  if (nameParts.length === 0) return "U";
  if (nameParts.length === 1) return nameParts[0].slice(0, 2).toUpperCase();
  return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
}

export function UserDropdown({ isDashboard = false }: UserDropdownProps) {
  const isHydrated = useIsHydrated();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { theme, toggleTheme } = useTheme();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const isDark = theme === "dark";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  if (!isHydrated || !user) return null;

  const rawRole = (user as { role?: string; roles?: string[] }).role;
  const rawRoles = (user as { role?: string; roles?: string[] }).roles;

  const isAdmin =
    (typeof rawRole === "string" && rawRole.toUpperCase() === "ADMIN") ||
    (Array.isArray(rawRoles) && rawRoles.map((r) => r.toUpperCase()).includes("ADMIN"));

  const userRoleDisplay = isAdmin ? "ADMIN" : "USER";

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={`User menu for ${user.name}`}
        className="group flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] p-1 pr-3 text-xs font-medium text-gray-200 backdrop-blur-md transition-all duration-200 hover:border-cyan-500/30 hover:bg-white/[0.08] hover:shadow-[0_0_15px_rgba(34,211,238,0.15)] focus:outline-none"
      >
        <span className="relative flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 text-[11px] font-bold text-zinc-950 shadow-inner ring-1 ring-white/20">
          {getInitials(user.name || "User")}
        </span>
        <span className="max-w-[110px] truncate text-xs font-semibold tracking-wide text-gray-200 group-hover:text-cyan-300">
          {user.name}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-300 group-hover:text-cyan-400 ${
            isOpen ? "rotate-180 text-cyan-400" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2.5 w-64 origin-top-right rounded-2xl border border-white/10 bg-[#090f11]/90 p-2 shadow-[0_10px_38px_rgba(0,0,0,0.5),0_0_20px_rgba(34,211,238,0.05)] backdrop-blur-xl transition-all animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header: Profile Overview */}
          <div className="mb-1.5 flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 font-bold text-xs">
              {getInitials(user.name || "User")}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-gray-100">{user.name}</p>
              {"email" in user && user.email ? (
                <p className="truncate text-[10px] text-gray-400">{String(user.email)}</p>
              ) : (
                <p className="truncate text-[10px] text-gray-500">Workspace Member</p>
              )}
            </div>
            <span
              className={`shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-extrabold tracking-wider border ${
                isAdmin
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.15)]"
                  : "border-cyan-500/30 bg-cyan-500/10 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.15)]"
              }`}
            >
              {userRoleDisplay}
            </span>
          </div>

          {/* Navigation Items */}
          <div className="space-y-0.5">
            {isDashboard && (
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-gray-400 transition-colors hover:bg-white/[0.06] hover:text-gray-100"
              >
                <Home className="h-4 w-4 text-gray-400 transition-colors group-hover:text-cyan-400" />
                <span>Home</span>
              </Link>
            )}

            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-gray-400 transition-colors hover:bg-white/[0.06] hover:text-gray-100"
            >
              <LayoutDashboard className="h-4 w-4 text-gray-400 transition-colors group-hover:text-cyan-400" />
              <span>Dashboard</span>
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-amber-400/90 transition-colors hover:bg-amber-500/10 hover:text-amber-300"
              >
                <ShieldCheck className="h-4 w-4 text-amber-400 transition-transform group-hover:scale-110" />
                <span>Admin Console</span>
              </Link>
            )}
          </div>

          {/* Preferences Divider */}
          <div className="my-1.5 border-t border-white/[0.06] pt-1.5 space-y-0.5">
            <Link
              href="/dashboard/appearance"
              onClick={() => setIsOpen(false)}
              className="group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-gray-400 transition-colors hover:bg-white/[0.06] hover:text-gray-100"
            >
              <Palette className="h-4 w-4 text-gray-400 transition-colors group-hover:text-cyan-400" />
              <span>Appearance</span>
            </Link>

            <Link
              href="/dashboard/accessibility"
              onClick={() => setIsOpen(false)}
              className="group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-gray-400 transition-colors hover:bg-white/[0.06] hover:text-gray-100"
            >
              <Accessibility className="h-4 w-4 text-gray-400 transition-colors group-hover:text-cyan-400" />
              <span>Accessibility</span>
            </Link>

            <Link
              href="/dashboard/settings"
              onClick={() => setIsOpen(false)}
              className="group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-gray-400 transition-colors hover:bg-white/[0.06] hover:text-gray-100"
            >
              <Settings className="h-4 w-4 text-gray-400 transition-colors group-hover:text-cyan-400" />
              <span>Settings</span>
            </Link>
          </div>

          {/* Theme Toggle */}
          <div className="my-1.5 border-t border-white/[0.06] pt-1.5">
            <button
              type="button"
              onClick={toggleTheme}
              className="group flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium text-gray-400 transition-colors hover:bg-white/[0.06] hover:text-gray-100"
            >
              <span className="flex items-center gap-2.5">
                {isDark ? (
                  <Sun className="h-4 w-4 text-amber-400 transition-transform group-hover:rotate-45" />
                ) : (
                  <Moon className="h-4 w-4 text-cyan-400 transition-transform group-hover:-rotate-12" />
                )}
                <span>Theme</span>
              </span>
              <span className="rounded bg-white/[0.05] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gray-400 group-hover:border group-hover:border-white/10">
                {theme}
              </span>
            </button>
          </div>

          {/* Sign Out */}
          <div className="mt-1.5 border-t border-white/[0.06] pt-1.5">
            <button
              type="button"
              onClick={() => {
                clearAuth();
                setIsOpen(false);
              }}
              className="group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-red-400/90 transition-colors hover:bg-red-500/10 hover:text-red-300"
            >
              <LogOut className="h-4 w-4 text-red-400 transition-transform group-hover:-translate-x-0.5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
