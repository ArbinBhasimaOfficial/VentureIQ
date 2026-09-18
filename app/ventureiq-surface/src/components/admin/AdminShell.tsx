"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  FileText,
  FolderTree,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Sparkles,
  Users,
  Waves,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

const links = [
  ["Overview", "/admin", LayoutDashboard],
  ["Users", "/admin/users", Users],
  ["Reports", "/admin/reports", FileText],
  ["Trends", "/admin/trends", Waves],
  ["Categories", "/admin/categories", FolderTree],
  ["Analytics", "/admin/analytics", BarChart3],
] as const;

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  if (user && user.role !== "ADMIN") {
    router.replace("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#050a0b] text-gray-100">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-white/[0.06] bg-[#070d0f] p-5 lg:block">
        <Link href="/admin" className="flex items-center gap-3 px-2 py-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-cyan-400">
            <span className="h-3 w-3 rounded-full bg-[#050a0b]" />
          </span>
          <span className="font-bold">
            Venture<span className="text-cyan-400">IQ</span>
          </span>
        </Link>
        <div className="mt-8 flex items-center gap-2 border border-emerald-400/20 bg-emerald-400/5 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-emerald-300">
          <ShieldCheck className="h-3.5 w-3.5" /> Admin console
        </div>
        <nav className="mt-8 space-y-1">
          {links.map(([label, href, Icon]) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm ${pathname === href ? "bg-cyan-400/10 text-cyan-300" : "text-gray-500 hover:text-gray-200"}`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          onClick={() => {
            clearAuth();
            router.replace("/login");
          }}
          className="absolute bottom-6 left-5 flex items-center gap-2 text-xs text-gray-600 hover:text-red-300"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </aside>
      <main className="lg:pl-64">
        <header className="flex min-h-16 items-center justify-between border-b border-white/[0.06] px-5 sm:px-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-400">
              VentureIQ administration
            </p>
            <p className="mt-1 text-xs text-gray-600">
              {pathname === "/admin" ? "Overview" : pathname.split("/").pop()}
            </p>
          </div>
          <Sparkles className="h-4 w-4 text-cyan-400" />
        </header>
        <nav className="flex gap-4 overflow-x-auto border-b border-white/[0.06] px-5 py-3 text-xs text-gray-500 lg:hidden">
          {links.map(([label, href]) => (
            <Link key={href} href={href} className="whitespace-nowrap">
              {label}
            </Link>
          ))}
        </nav>
        <div className="mx-auto max-w-7xl p-5 sm:p-8">{children}</div>
      </main>
    </div>
  );
}
