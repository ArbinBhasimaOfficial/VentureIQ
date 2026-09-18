"use client";

import { useAuthStore } from "@/store/auth.store";

export default function DashboardSettingsPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-400">
          Workspace settings
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-100">Profile</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
          Your account identity is loaded from VentureIQ Core.
        </p>
      </header>
      <section className="max-w-2xl border border-white/[0.06] bg-white/[0.02] p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Name</p>
            <p className="mt-2 text-sm text-gray-200">{user?.name ?? "-"}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Role</p>
            <p className="mt-2 text-sm text-gray-200">{user?.role ?? "-"}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Email</p>
            <p className="mt-2 text-sm text-gray-200">{user?.email ?? "-"}</p>
          </div>
        </div>
        <p className="mt-8 border-t border-white/[0.06] pt-5 text-xs leading-5 text-gray-600">
          Profile editing and password changes use the backend endpoints already available and can
          be added here next.
        </p>
      </section>
    </div>
  );
}
