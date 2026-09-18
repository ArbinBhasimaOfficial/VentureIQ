"use client";

import { useQuery } from "@tanstack/react-query";
import { Activity, Building2, FileText, Users } from "lucide-react";
import { getAdminAnalytics } from "@/lib/api/admin";

export default function AdminOverviewPage() {
  const analytics = useQuery({ queryKey: ["admin", "analytics"], queryFn: getAdminAnalytics });
  const cards = [
    ["Total reports", analytics.data?.overview.totalReports, FileText],
    ["Published reports", analytics.data?.overview.publishedReports, Activity],
    ["Companies", analytics.data?.overview.totalCompanies, Building2],
    ["Users", analytics.data?.overview.totalUsers, Users],
  ] as const;
  return (
    <div className="space-y-8">
      <header>
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-400">
          Admin overview
        </p>
        <h1 className="mt-3 text-3xl font-bold">Control room</h1>
        <p className="mt-3 text-sm text-gray-500">
          Monitor the data layer and manage the VentureIQ workspace.
        </p>
      </header>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, Icon]) => (
          <div key={label} className="border border-white/[0.06] bg-white/[0.02] p-5">
            <Icon className="h-4 w-4 text-cyan-400" />
            <p className="mt-8 text-3xl font-bold">{value ?? "--"}</p>
            <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-gray-600">
              {label}
            </p>
          </div>
        ))}
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="border border-white/[0.06] p-5">
          <h2 className="font-semibold">Reports by industry</h2>
          <div className="mt-5 space-y-3">
            {analytics.data?.industries.map((item) => (
              <div key={item.industry} className="flex justify-between text-sm">
                <span className="text-gray-400">{item.industry}</span>
                <span className="text-cyan-400">{item.reportCount}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="border border-white/[0.06] p-5">
          <h2 className="font-semibold">Publishing trend</h2>
          <div className="mt-5 space-y-3">
            {analytics.data?.publishing.map((item) => (
              <div key={item.month} className="flex justify-between text-sm">
                <span className="text-gray-400">{item.month}</span>
                <span className="text-cyan-400">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
