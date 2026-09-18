"use client";

import { useQuery } from "@tanstack/react-query";
import { Database, Download, FileText, MapPin, Sparkles } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import ReportCharts from "@/components/dashboard/ReportCharts";
import {
  getDashboardCategories,
  getDashboardReports,
  getReportDatasets,
} from "@/lib/api/dashboard";
import { demoReportData, makeDownloadPayload, normalizeReportData } from "@/lib/report-demo-data";

const demoReport = {
  id: "demo-report",
  categoryId: "demo-category",
  title: "Demo market demand signal",
  summary:
    "A generated report dataset for exploring the VentureIQ visualization workspace before production data is available.",
  industry: "Cross-industry",
  region: "Global",
  status: "PUBLISHED" as const,
  createdAt: new Date().toISOString(),
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(value),
  );
}

export default function DashboardReportsPage() {
  const searchParams = useSearchParams();
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const reports = useQuery({
    queryKey: ["dashboard", "reports", page],
    queryFn: () => getDashboardReports(page, pageSize),
  });
  const categories = useQuery({
    queryKey: ["dashboard", "categories"],
    queryFn: getDashboardCategories,
  });

  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const backendReports = reports.data?.reports ?? [];
  const availableReports = backendReports.length ? backendReports : [demoReport];
  const requestedReportId = searchParams.get("report");
  const activeReportId = selectedReportId ?? requestedReportId;
  const selectedReport =
    availableReports.find((report) => report.id === activeReportId) ?? availableReports[0];
  const categoryName =
    categories.data?.find((category) => category.id === selectedReport.categoryId)?.name ??
    "Uncategorized";
  const datasets = useQuery({
    queryKey: ["dashboard", "datasets", selectedReport.id],
    queryFn: () => getReportDatasets(selectedReport.id),
    enabled: selectedReport.id !== demoReport.id,
  });
  const selectedDataset = datasets.data?.[0];
  const chartData = selectedDataset ? normalizeReportData(selectedDataset.data) : demoReportData;
  const isDemo = !selectedDataset || chartData.source === "demo";

  const downloadReport = () => {
    const payload = makeDownloadPayload(selectedReport, chartData);
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${selectedReport.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-dataset.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col justify-between gap-5 border-b border-white/[0.06] pb-7 lg:flex-row lg:items-end">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-400">
            Research library
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-100">
            Reports and visual data
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
            Select a report to inspect its dataset as charts and download the underlying report
            package.
          </p>
        </div>
        <button
          type="button"
          onClick={downloadReport}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-400 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#050a0b] transition hover:bg-cyan-300"
        >
          <Download className="h-3.5 w-3.5" aria-hidden="true" /> Download dataset
        </button>
      </header>

      {isDemo && (
        <div className="flex items-start gap-3 border border-amber-400/20 bg-amber-400/[0.06] px-4 py-3 text-xs leading-5 text-amber-200/80">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />
          <p>
            No report dataset is attached yet. This view is using generated demo data so the chart
            workspace remains usable.
          </p>
        </div>
      )}

      <section className="grid gap-6 xl:grid-cols-[300px_1fr]">
        <div className="border border-white/[0.06] bg-white/[0.02]">
          <div className="border-b border-white/[0.06] px-5 py-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
              Available reports
            </p>
            <h2 className="mt-1 text-lg font-semibold text-gray-100">Choose a report</h2>
          </div>
          <div className="divide-y divide-white/[0.05]">
            {availableReports.map((report) => (
              <button
                key={report.id}
                type="button"
                onClick={() => setSelectedReportId(report.id)}
                className={`w-full px-5 py-4 text-left transition-colors ${selectedReport.id === report.id ? "border-l-2 border-cyan-400 bg-cyan-400/[0.06]" : "border-l-2 border-transparent hover:bg-white/[0.03]"}`}
              >
                <p className="line-clamp-2 text-sm font-semibold text-gray-200">{report.title}</p>
                <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-gray-600">
                  {report.industry} ·{" "}
                  {categories.data?.find((category) => category.id === report.categoryId)?.name ??
                    "Uncategorized"}
                </p>
              </button>
            ))}
          </div>
          {reports.data && reports.data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-white/[0.06] px-5 py-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
                Page {reports.data.pagination.page} of {reports.data.pagination.totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage((current) => current - 1)}
                  className="border border-white/[0.08] px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 disabled:cursor-not-allowed disabled:opacity-30 hover:text-cyan-400"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={page >= reports.data.pagination.totalPages}
                  onClick={() => setPage((current) => current + 1)}
                  className="border border-white/[0.08] px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 disabled:cursor-not-allowed disabled:opacity-30 hover:text-cyan-400"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <article className="border border-white/[0.06] bg-white/[0.02] p-5 sm:p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <div className="flex items-center gap-2 text-cyan-400">
                  <FileText className="h-4 w-4" aria-hidden="true" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                    Selected report
                  </span>
                </div>
                <h2 className="mt-4 text-2xl font-bold tracking-tight text-gray-100">
                  {selectedReport.title}
                </h2>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                {selectedReport.status}
              </span>
            </div>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-gray-500">
              {selectedReport.summary}
            </p>
            <div className="mt-5 flex flex-wrap gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-600">
              <span>{selectedReport.industry}</span>
              <span>{categoryName}</span>
              <span
                className={
                  selectedReport.status === "PUBLISHED"
                    ? "text-emerald-400"
                    : selectedReport.status === "DRAFT"
                      ? "text-amber-400"
                      : "text-gray-600"
                }
              >
                {selectedReport.status}
              </span>
              {selectedReport.region && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {selectedReport.region}
                </span>
              )}
              <span>{formatDate(selectedReport.createdAt)}</span>
              {selectedDataset && (
                <span className="inline-flex items-center gap-1 text-cyan-400">
                  <Database className="h-3 w-3" />
                  {selectedDataset.name}
                </span>
              )}
            </div>
          </article>

          <ReportCharts data={chartData} />
        </div>
      </section>
    </div>
  );
}
