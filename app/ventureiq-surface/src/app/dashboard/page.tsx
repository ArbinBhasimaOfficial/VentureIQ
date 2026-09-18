"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  ArrowUpRight,
  Bell,
  Building2,
  FileText,
  Layers3,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

import {
  getDashboardAlerts,
  getDashboardCategories,
  getDashboardCompanies,
  getDashboardReports,
  getDashboardTrends,
} from "@/lib/api/dashboard";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(value));
}

export default function DashboardPage() {
  const reports = useQuery({
    queryKey: ["dashboard", "reports"],
    queryFn: () => getDashboardReports(1, 50),
  });
  const categories = useQuery({
    queryKey: ["dashboard", "categories"],
    queryFn: getDashboardCategories,
  });
  const trends = useQuery({ queryKey: ["dashboard", "trends"], queryFn: getDashboardTrends });
  const companies = useQuery({
    queryKey: ["dashboard", "companies"],
    queryFn: getDashboardCompanies,
  });
  const alerts = useQuery({ queryKey: ["dashboard", "alerts"], queryFn: getDashboardAlerts });

  const isLoading =
    reports.isLoading ||
    categories.isLoading ||
    trends.isLoading ||
    companies.isLoading ||
    alerts.isLoading;
  const hasError =
    reports.isError || categories.isError || trends.isError || companies.isError || alerts.isError;
  const reportRows = reports.data?.reports ?? [];
  const industryCounts = reportRows.reduce<Record<string, number>>((counts, report) => {
    counts[report.industry] = (counts[report.industry] ?? 0) + 1;
    return counts;
  }, {});
  const categoryCounts = reportRows.reduce<Record<string, number>>((counts, report) => {
    counts[report.categoryId] = (counts[report.categoryId] ?? 0) + 1;
    return counts;
  }, {});

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <section className="flex flex-col justify-between gap-5 border-b border-zinc-200 pb-7 dark:border-white/[0.06] sm:flex-row sm:items-end">
        <div className="w-full">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-600 dark:text-cyan-400">
            Decision workspace
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 dark:text-gray-100 sm:text-4xl">
            Your market, in motion.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-600 dark:text-gray-400">
            A live readout of the reports, companies, and signals connected to your VentureIQ
            workspace.
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 self-start text-xs font-bold uppercase tracking-widest text-zinc-500 transition-colors hover:text-cyan-600 dark:text-gray-400 dark:hover:text-cyan-400 sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" /> Refresh data
        </button>
      </section>

      {/* Error Alert */}
      {hasError && (
        <div className="border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-600 dark:text-red-300">
          Some workspace data could not be loaded. Check that the API is running at the configured
          URL.
        </div>
      )}

      {/* Summary Stat Cards */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Published reports",
            value: reports.data?.pagination.total ?? 0,
            icon: FileText,
          },
          {
            label: "Market signals",
            value: trends.data?.pagination.total ?? trends.data?.trends.length ?? 0,
            icon: Activity,
          },
          {
            label: "Companies tracked",
            value: companies.data?.pagination.total ?? 0,
            icon: Building2,
          },
          { label: "Unread alerts", value: alerts.data?.unreadCount ?? 0, icon: Bell },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="border border-zinc-200 bg-white p-5 shadow-xs dark:border-white/[0.06] dark:bg-white/[0.025]"
          >
            <div className="flex items-center justify-between">
              <Icon className="h-4 w-4 text-cyan-600 dark:text-cyan-400" aria-hidden="true" />
              <span className="text-2xl font-bold text-zinc-900 dark:text-gray-100">
                {isLoading ? "--" : value}
              </span>
            </div>
            <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 dark:text-gray-500">
              {label}
            </p>
          </div>
        ))}
      </section>

      {/* Taxonomy & Lens Grid */}
      <section className="grid gap-6 xl:grid-cols-2">
        <div className="border border-zinc-200 bg-white dark:border-white/[0.06] dark:bg-white/[0.02]">
          <div className="border-b border-zinc-200 px-5 py-4 dark:border-white/[0.06]">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">
              Taxonomy layer
            </p>
            <h2 className="mt-1 text-lg font-semibold text-zinc-900 dark:text-gray-100">
              Reports by category
            </h2>
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-white/[0.05]">
            {categories.data?.map((category) => (
              <div key={category.id} className="flex items-center justify-between gap-4 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm text-zinc-800 dark:text-gray-300">
                    {category.name}
                  </p>
                  <p className="mt-1 truncate text-[10px] text-zinc-500 dark:text-gray-500">
                    {category.description ?? category.slug}
                  </p>
                </div>
                <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400">
                  {categoryCounts[category.id] ?? 0}
                </span>
              </div>
            ))}
            {!categories.isLoading && !categories.data?.length && (
              <p className="px-5 py-8 text-sm text-zinc-500 dark:text-gray-500">
                No categories are available.
              </p>
            )}
          </div>
        </div>

        <div className="border border-zinc-200 bg-white dark:border-white/[0.06] dark:bg-white/[0.02]">
          <div className="border-b border-zinc-200 px-5 py-4 dark:border-white/[0.06]">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">
              Market lens
            </p>
            <h2 className="mt-1 text-lg font-semibold text-zinc-900 dark:text-gray-100">
              Reports by industry
            </h2>
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-white/[0.05]">
            {Object.entries(industryCounts)
              .sort(([, first], [, second]) => second - first)
              .map(([industry, count]) => (
                <div key={industry} className="flex items-center justify-between gap-4 px-5 py-3">
                  <p className="text-sm text-zinc-800 dark:text-gray-300">{industry}</p>
                  <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400">
                    {count}
                  </span>
                </div>
              ))}
            {!reports.isLoading && !Object.keys(industryCounts).length && (
              <p className="px-5 py-8 text-sm text-zinc-500 dark:text-gray-500">
                No industries are available.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="border border-zinc-200 bg-white dark:border-white/[0.06] dark:bg-white/[0.02]">
          <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-white/[0.06]">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">
                Latest intelligence
              </p>
              <h2 className="mt-1 text-lg font-semibold text-zinc-900 dark:text-gray-100">
                Recent reports
              </h2>
            </div>
            <Link
              href="/dashboard/reports"
              className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-cyan-600 dark:text-gray-400 dark:hover:text-cyan-400"
            >
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-white/[0.05]">
            {reports.data?.reports.length ? (
              reports.data.reports.map((report) => (
                <article
                  key={report.id}
                  className="flex items-start justify-between gap-4 px-5 py-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-semibold text-zinc-800 dark:text-gray-200">
                        {report.title}
                      </h3>
                      <span
                        className={`shrink-0 text-[9px] font-bold uppercase tracking-wider ${
                          report.status === "PUBLISHED"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : report.status === "DRAFT"
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-zinc-500 dark:text-gray-500"
                        }`}
                      >
                        {report.status}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-xs text-zinc-500 dark:text-gray-400">
                      {report.industry}
                      {report.region ? ` / ${report.region}` : ""}
                    </p>
                  </div>
                  <time className="shrink-0 text-[10px] font-mono text-zinc-400 dark:text-gray-500">
                    {formatDate(report.createdAt)}
                  </time>
                </article>
              ))
            ) : (
              <p className="px-5 py-8 text-sm text-zinc-500 dark:text-gray-500">
                No reports are available yet.
              </p>
            )}
          </div>
        </div>

        <div className="border border-zinc-200 bg-white dark:border-white/[0.06] dark:bg-white/[0.02]">
          <div className="border-b border-zinc-200 px-5 py-4 dark:border-white/[0.06]">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">
              Attention queue
            </p>
            <h2 className="mt-1 text-lg font-semibold text-zinc-900 dark:text-gray-100">
              Unread alerts
            </h2>
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-white/[0.05]">
            {alerts.data?.alerts.length ? (
              alerts.data.alerts.map((alert) => (
                <article key={alert.id} className="px-5 py-4">
                  <p className="text-sm leading-6 text-zinc-700 dark:text-gray-300">
                    {alert.message}
                  </p>
                  <time className="mt-2 block text-[10px] font-mono text-zinc-400 dark:text-gray-500">
                    {formatDate(alert.createdAt)}
                  </time>
                </article>
              ))
            ) : (
              <p className="px-5 py-8 text-sm text-zinc-500 dark:text-gray-500">
                You are all caught up.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Footer / Callout Banner */}
      <section className="border border-cyan-500/20 bg-cyan-500/5 p-5 dark:border-cyan-400/15 dark:bg-cyan-400/[0.04] sm:p-6">
        <div className="flex items-start gap-4">
          <Layers3
            className="mt-1 h-5 w-5 shrink-0 text-cyan-600 dark:text-cyan-400"
            aria-hidden="true"
          />
          <div>
            <h2 className="font-semibold text-zinc-900 dark:text-gray-100">
              Keep your signal layer current
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-gray-400">
              Explore market trends and companies in the connected workspace. The views below are
              populated directly from VentureIQ Core.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
