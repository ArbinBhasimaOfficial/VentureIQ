"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Database, Download, FileText, MapPin, Sparkles } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import ReportCharts from "@/components/dashboard/ReportCharts";
import { getDashboardCategories, getDashboardReport, getReportDatasets } from "@/lib/api/dashboard";
import { demoReportData, makeDownloadPayload, normalizeReportData } from "@/lib/report-demo-data";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(value),
  );
}

export default function ReportDetailPage() {
  const params = useParams<{ id: string }>();
  const reportId = params.id;
  const report = useQuery({
    queryKey: ["dashboard", "report", reportId],
    queryFn: () => getDashboardReport(reportId),
    enabled: Boolean(reportId),
  });
  const categories = useQuery({
    queryKey: ["dashboard", "categories"],
    queryFn: getDashboardCategories,
  });
  const datasets = useQuery({
    queryKey: ["dashboard", "datasets", reportId],
    queryFn: () => getReportDatasets(reportId),
    enabled: Boolean(reportId),
  });
  const selectedReport = report.data;
  const selectedDataset = datasets.data?.[0];
  const chartData = selectedDataset ? normalizeReportData(selectedDataset.data) : demoReportData;
  const categoryName =
    categories.data?.find((category) => category.id === selectedReport?.categoryId)?.name ??
    "Uncategorized";

  const downloadReport = () => {
    if (!selectedReport) return;
    const payload = makeDownloadPayload(selectedReport, chartData);
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${selectedReport.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-dataset.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  if (report.isLoading) return <div className="py-16 text-sm text-gray-600">Loading report...</div>;
  if (report.isError || !selectedReport)
    return (
      <div className="space-y-5 py-16">
        <p className="text-sm text-red-300">This report could not be loaded from Core.</p>
        <Link
          href="/dashboard/reports"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-400"
        >
          <ArrowLeft className="h-4 w-4" /> Back to reports
        </Link>
      </div>
    );

  return (
    <div className="space-y-8">
      <header className="flex flex-col justify-between gap-5 border-b border-white/[0.06] pb-7 lg:flex-row lg:items-end">
        <div>
          <Link
            href="/dashboard/reports"
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-600 hover:text-cyan-400"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Reports library
          </Link>
          <p className="mt-7 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
            <FileText className="h-4 w-4" /> Report detail
          </p>
          <h1 className="mt-3 max-w-4xl text-3xl font-bold tracking-tight text-gray-100 sm:text-5xl">
            {selectedReport.title}
          </h1>
        </div>
        <button
          type="button"
          onClick={downloadReport}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-400 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#050a0b]"
        >
          <Download className="h-3.5 w-3.5" /> Download dataset
        </button>
      </header>
      <article className="border border-white/[0.06] bg-white/[0.02] p-5 sm:p-7">
        <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-600">
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
          <span>{selectedReport.industry}</span>
          <span>{categoryName}</span>
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
        <p className="mt-6 max-w-4xl text-base leading-8 text-gray-400">{selectedReport.summary}</p>
        <div className="mt-8 whitespace-pre-wrap border-t border-white/[0.06] pt-7 text-sm leading-7 text-gray-500">
          {selectedReport.content ?? "Full report content is not available."}
        </div>
      </article>
      {!selectedDataset && (
        <div className="flex items-start gap-3 border border-amber-400/20 bg-amber-400/[0.06] px-4 py-3 text-xs leading-5 text-amber-200/80">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
          <p>
            No dataset is attached to this report yet. Generated demo data is shown for the
            visualization preview.
          </p>
        </div>
      )}
      <ReportCharts data={chartData} />
    </div>
  );
}
