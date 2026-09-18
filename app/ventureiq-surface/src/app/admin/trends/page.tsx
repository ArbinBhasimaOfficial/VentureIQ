"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { getDashboardTrends } from "@/lib/api/dashboard";

export default function AdminTrendsPage() {
  const trends = useQuery({ queryKey: ["admin", "trends"], queryFn: getDashboardTrends });
  const icons = { RISING: ArrowUpRight, FALLING: ArrowDownRight, STABLE: Minus } as const;
  return (
    <div className="space-y-7">
      <header>
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-400">
          Signal operations
        </p>
        <h1 className="mt-3 text-3xl font-bold">Trends</h1>
        <p className="mt-3 text-sm text-gray-500">
          Review indexed market signals and their direction.
        </p>
      </header>
      <div className="grid gap-4 lg:grid-cols-2">
        {trends.data?.trends.map((trend) => {
          const Icon = icons[trend.direction];
          return (
            <article key={trend.id} className="border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="flex items-center justify-between">
                <Icon
                  className={
                    trend.direction === "RISING"
                      ? "text-emerald-400"
                      : trend.direction === "FALLING"
                        ? "text-red-400"
                        : "text-gray-500"
                  }
                />
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
                  {trend.industry}
                </span>
              </div>
              <h2 className="mt-6 font-semibold">{trend.title}</h2>
              <p className="mt-2 text-sm leading-6 text-gray-500">{trend.description}</p>
              <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                {trend.direction}
              </p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
