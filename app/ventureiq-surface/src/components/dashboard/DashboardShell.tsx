"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell } from "lucide-react";

import Sidebar from "@/components/layout/Sidebar";
import DashboardSearch from "@/components/dashboard/DashboardSearch";
import { UserDropdown } from "@/components/layout/UserDropDown";
import { useCurrentUser } from "@/hooks/use.auth";
import { useAuthStore } from "@/store/auth.store";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAuthStore((state) => state.token);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const user = useAuthStore((state) => state.user);
  const rememberMe = useAuthStore((state) => state.rememberMe);
  const setAuth = useAuthStore((state) => state.setAuth);
  const currentUser = useCurrentUser();

  useEffect(() => {
    if (hasHydrated && !token) {
      router.replace("/login");
    }
  }, [hasHydrated, router, token]);

  useEffect(() => {
    if (currentUser.data?.data && token) {
      setAuth(currentUser.data.data, token, rememberMe);
    }
  }, [currentUser.data, rememberMe, setAuth, token]);

  if (!hasHydrated || !token || currentUser.isLoading || currentUser.isFetching) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050a0b] text-cyan-400">
        <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.24em]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
          Verifying session
        </div>
      </main>
    );
  }

  if (currentUser.isError || !user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[#050a0b] text-gray-100">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="min-w-0 flex-1">
        <header className="flex min-h-16 flex-wrap items-center justify-between gap-4 border-b border-white/[0.05] px-5 py-3 sm:px-8 lg:flex-nowrap">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-400">
              VentureIQ workspace
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {pathname === "/dashboard" ? "Overview" : pathname.split("/").pop()}
            </p>
          </div>

          <div className="order-3 w-full lg:order-2 lg:flex-1 lg:px-10">
            <DashboardSearch />
          </div>

          <div className="order-2 flex items-center gap-3 lg:order-3">
            <button
              type="button"
              aria-label="Notifications"
              className="p-2 text-gray-500 transition-colors hover:text-cyan-400"
            >
              <Bell className="h-4 w-4" aria-hidden="true" />
            </button>
            <UserDropdown isDashboard={true} />
          </div>
        </header>

        <div className="lg:hidden">
          <nav className="flex gap-5 overflow-x-auto border-b border-white/[0.05] px-5 py-3 text-xs text-gray-500 sm:px-8">
            <Link href="/dashboard" className="whitespace-nowrap hover:text-cyan-400">
              Overview
            </Link>
            <Link href="/dashboard/markets" className="whitespace-nowrap hover:text-cyan-400">
              Markets
            </Link>
            <Link href="/dashboard/industries" className="whitespace-nowrap hover:text-cyan-400">
              Industries
            </Link>
            <Link href="/dashboard/reports" className="whitespace-nowrap hover:text-cyan-400">
              Reports
            </Link>
            <Link href="/dashboard/settings" className="whitespace-nowrap hover:text-cyan-400">
              Settings
            </Link>
          </nav>
        </div>

        <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
