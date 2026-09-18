"use client";

import { useQuery } from "@tanstack/react-query";
import { getAdminAnalytics } from "@/lib/api/admin";

export default function AdminAnalyticsPage() {
  const analytics = useQuery({ queryKey: ["admin", "analytics"], queryFn: getAdminAnalytics });
  return (
    <div className="space-y-7">
      <header>
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-400">
          Measurement
        </p>
        <h1 className="mt-3 text-3xl font-bold">Analytics</h1>
        <p className="mt-3 text-sm text-gray-500">
          Operational reporting from the Core analytics module.
        </p>
      </header>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Object.entries(analytics.data?.overview ?? {}).map(([label, value]) => (
          <div key={label} className="border border-white/[0.06] p-5">
            <p className="text-2xl font-bold text-cyan-400">{value}</p>
            <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-gray-600">
              {label.replace(/[A-Z]/g, (letter) => ` ${letter}`).trim()}
            </p>
          </div>
        ))}
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="border border-white/[0.06] p-5">
          <h2 className="font-semibold">Category performance</h2>
          <div className="mt-5 space-y-3">
            {analytics.data?.categories.map((row) => (
              <div key={row.categoryName} className="flex justify-between text-sm">
                <span className="text-gray-400">{row.categoryName}</span>
                <span className="text-cyan-400">{row.reportCount}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="border border-white/[0.06] p-5">
          <h2 className="font-semibold">Industry performance</h2>
          <div className="mt-5 space-y-3">
            {analytics.data?.industries.map((row) => (
              <div key={row.industry} className="flex justify-between text-sm">
                <span className="text-gray-400">{row.industry}</span>
                <span className="text-cyan-400">{row.reportCount}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
