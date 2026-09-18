"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowDownRight, ArrowUpRight, Minus, Search } from "lucide-react";
import { useState } from "react";

import { getDashboardCompanies, getDashboardTrends } from "@/lib/api/dashboard";

const directionIcon = { RISING: ArrowUpRight, FALLING: ArrowDownRight, STABLE: Minus } as const;

export default function MarketsPage() {
  const [search, setSearch] = useState("");
  const trends = useQuery({ queryKey: ["dashboard", "trends"], queryFn: getDashboardTrends });
  const companies = useQuery({
    queryKey: ["dashboard", "companies"],
    queryFn: getDashboardCompanies,
  });
  const filteredCompanies =
    companies.data?.companies.filter((company) =>
      company.name.toLowerCase().includes(search.toLowerCase()),
    ) ?? [];

  return (
    <div className="space-y-8">
      <header>
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-400">
          Market intelligence
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-100">
          Markets and signals
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
          Track the trends and companies currently indexed by your VentureIQ data layer.
        </p>
      </header>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="border border-white/[0.06] bg-white/[0.02]">
          <div className="border-b border-white/[0.06] px-5 py-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
              Signal register
            </p>
            <h2 className="mt-1 text-lg font-semibold text-gray-100">Current trends</h2>
          </div>
          <div className="divide-y divide-white/[0.05]">
            {trends.data?.trends.length ? (
              trends.data.trends.map((trend) => {
                const Icon = directionIcon[trend.direction];
                return (
                  <article key={trend.id} className="flex gap-4 px-5 py-5">
                    <Icon
                      className={`mt-1 h-4 w-4 shrink-0 ${trend.direction === "RISING" ? "text-emerald-400" : trend.direction === "FALLING" ? "text-red-400" : "text-gray-500"}`}
                      aria-hidden="true"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-200">{trend.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-gray-500">{trend.description}</p>
                      <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-gray-600">
                        {trend.industry} · {trend.direction}
                      </p>
                    </div>
                  </article>
                );
              })
            ) : (
              <p className="px-5 py-8 text-sm text-gray-600">No trends are available yet.</p>
            )}
          </div>
        </div>

        <div className="border border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
                Entity index
              </p>
              <h2 className="mt-1 text-lg font-semibold text-gray-100">Companies</h2>
            </div>
            <span className="text-xs text-gray-600">
              {companies.data?.pagination.total ?? 0} total
            </span>
          </div>
          <label className="relative block border-b border-white/[0.05] px-5 py-3">
            <Search
              className="absolute left-5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-600"
              aria-hidden="true"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Filter companies"
              className="w-full bg-transparent pl-6 text-xs text-gray-300 outline-none placeholder:text-gray-700"
            />
          </label>
          <div className="divide-y divide-white/[0.05]">
            {filteredCompanies.map((company) => (
              <article key={company.id} className="px-5 py-4">
                <h3 className="text-sm font-semibold text-gray-200">{company.name}</h3>
                <p className="mt-1 text-xs text-gray-600">
                  {company.headquarters ?? "Location not listed"}
                  {company.foundedYear ? ` · Founded ${company.foundedYear}` : ""}
                </p>
              </article>
            ))}
            {!filteredCompanies.length && (
              <p className="px-5 py-8 text-sm text-gray-600">No matching companies.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
