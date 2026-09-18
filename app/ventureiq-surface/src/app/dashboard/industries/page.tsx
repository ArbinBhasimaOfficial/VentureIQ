"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Factory, FileText } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { getDashboardReports } from "@/lib/api/dashboard";

export default function IndustriesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedIndustry = searchParams.get("industry");
  const allReports = useQuery({
    queryKey: ["dashboard", "reports", "all"],
    queryFn: () => getDashboardReports(1, 50),
  });
  const industryReports = useQuery({
    queryKey: ["dashboard", "industry-reports", selectedIndustry],
    queryFn: () => getDashboardReports(1, 50, selectedIndustry ?? undefined),
    enabled: Boolean(selectedIndustry),
  });

  const industryCounts = Object.entries(
    (allReports.data?.reports ?? []).reduce<Record<string, number>>((counts, report) => {
      counts[report.industry] = (counts[report.industry] ?? 0) + 1;
      return counts;
    }, {}),
  ).sort(([, first], [, second]) => second - first);

  const reports = selectedIndustry ? (industryReports.data?.reports ?? []) : [];

  return (
    <div className="space-y-8">
      <header className="border-b border-white/[0.06] pb-7">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-400">
          Market taxonomy
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-100">Industries</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
          Choose an industry to load the reports Core has indexed for that market.
        </p>
      </header>

      {!selectedIndustry ? (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {industryCounts.map(([industry, count]) => (
            <button
              key={industry}
              type="button"
              onClick={() =>
                router.push(`/dashboard/industries?industry=${encodeURIComponent(industry)}`)
              }
              className="group border border-white/[0.06] bg-white/[0.02] p-5 text-left transition-colors hover:border-cyan-400/30 hover:bg-cyan-400/[0.04]"
            >
              <div className="flex items-start justify-between gap-4">
                <Factory className="h-5 w-5 text-cyan-400" aria-hidden="true" />
                <ArrowRight
                  className="h-4 w-4 text-gray-700 transition-transform group-hover:translate-x-1 group-hover:text-cyan-400"
                  aria-hidden="true"
                />
              </div>
              <h2 className="mt-8 text-lg font-semibold text-gray-100">{industry}</h2>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-gray-600">
                {count} {count === 1 ? "report" : "reports"}
              </p>
            </button>
          ))}
          {!allReports.isLoading && !industryCounts.length && (
            <p className="border border-white/[0.06] px-5 py-8 text-sm text-gray-600">
              No industries are available yet.
            </p>
          )}
        </section>
      ) : (
        <section className="space-y-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
                Selected industry
              </p>
              <h2 className="mt-2 text-2xl font-bold text-gray-100">{selectedIndustry}</h2>
            </div>
            <button
              type="button"
              onClick={() => router.push("/dashboard/industries")}
              className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-cyan-400"
            >
              All industries
            </button>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {reports.map((report) => (
              <Link
                key={report.id}
                href={`/dashboard/reports/${encodeURIComponent(report.id)}`}
                className="border border-white/[0.06] bg-white/[0.02] p-5 transition-colors hover:border-cyan-400/30"
              >
                <div className="flex items-start justify-between gap-4">
                  <FileText className="h-5 w-5 text-cyan-400" aria-hidden="true" />
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest ${report.status === "PUBLISHED" ? "text-emerald-400" : report.status === "DRAFT" ? "text-amber-400" : "text-gray-600"}`}
                  >
                    {report.status}
                  </span>
                </div>
                <h3 className="mt-6 text-lg font-semibold text-gray-100">{report.title}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-500">{report.summary}</p>
                <p className="mt-5 text-[10px] font-bold uppercase tracking-widest text-gray-600">
                  {report.region ?? "Nepal"}
                </p>
              </Link>
            ))}
          </div>
          {!industryReports.isLoading && !reports.length && (
            <p className="border border-white/[0.06] px-5 py-8 text-sm text-gray-600">
              No reports found for this industry.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
