"use client";

import { useState, useSyncExternalStore } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { FileText, Loader2, AlertCircle, Search, Plus, Upload, Trash2, X } from "lucide-react";
import {
  getDashboardReports,
  getDashboardCategories,
  createMarketReport,
  uploadMarketReportPdf,
  removeMarketReport,
} from "@/lib/api/dashboard";

const emptySubscribe = () => () => {};

export default function AdminReportsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // ESLint-safe hydration check without state-in-effect warnings
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  // Form State
  const [newReport, setNewReport] = useState({
    title: "",
    summary: "",
    industry: "",
    region: "",
    categoryId: "",
  });

  const limit = 10;

  // Fetch Reports
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin", "reports", page, limit],
    queryFn: () => getDashboardReports(page, limit),
  });

  // Fetch Categories for dropdown
  const { data: categories = [] } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: getDashboardCategories,
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: createMarketReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });
      setIsModalOpen(false);
      setNewReport({ title: "", summary: "", industry: "", region: "", categoryId: "" });
      setFeedback({ type: "success", msg: "Report created successfully!" });
      setTimeout(() => setFeedback(null), 4000);
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      setFeedback({
        type: "error",
        msg: err?.response?.data?.message || "Failed to submit report. Please try again.",
      });
    },
  });

  // Upload PDF Mutation
  const uploadPdfMutation = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => uploadMarketReportPdf(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });
      setSelectedReportId(null);
      setFeedback({ type: "success", msg: "PDF uploaded successfully!" });
      setTimeout(() => setFeedback(null), 4000);
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      setFeedback({
        type: "error",
        msg: err?.response?.data?.message || "PDF upload failed.",
      });
    },
  });

  // Delete Report Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => removeMarketReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });
      setFeedback({ type: "success", msg: "Report deleted." });
      setTimeout(() => setFeedback(null), 4000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReport.title.trim() || !newReport.summary.trim()) return;

    createMutation.mutate({
      title: newReport.title,
      summary: newReport.summary,
      industry: newReport.industry,
      region: newReport.region || undefined,
      categoryId: newReport.categoryId || undefined,
    });
  };

  const handleFileUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedReportId(id);
      uploadPdfMutation.mutate({ id, file });
    }
  };

  const filteredReports = data?.reports?.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "ALL" || report.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-7">
      {/* Toast Alert Banner */}
      {feedback && (
        <div
          className={`flex items-center justify-between rounded-lg border px-4 py-3 text-xs ${
            feedback.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : "border-red-500/30 bg-red-500/10 text-red-400"
          }`}
        >
          <span>{feedback.msg}</span>
          <button onClick={() => setFeedback(null)} className="opacity-70 hover:opacity-100">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-400">
            Content operations
          </p>
          <h1 className="mt-2 text-3xl font-bold">Reports</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review every report, including drafts and archived records.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-md bg-cyan-500 px-4 py-2 text-sm font-semibold text-black hover:bg-cyan-400"
        >
          <Plus className="h-4 w-4" />
          Create Report
        </button>
      </header>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-white/[0.08] bg-black/20 py-2 pl-9 pr-4 text-sm text-gray-200 placeholder-gray-500 focus:border-cyan-400 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-400">Filter Status:</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-md border border-white/[0.08] bg-black/20 px-3 py-2 text-xs text-gray-200 focus:border-cyan-400 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="overflow-x-auto border border-white/[0.06]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/[0.06] text-[10px] uppercase tracking-widest text-gray-600">
            <tr>
              <th className="px-5 py-4">Report</th>
              <th className="px-5 py-4">Industry</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Region</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {(!isMounted || isLoading) && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-gray-400">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
                    <span>Loading reports...</span>
                  </div>
                </td>
              </tr>
            )}

            {isMounted && isError && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-red-400">
                  <div className="flex items-center justify-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    <span>
                      Failed to load reports:{" "}
                      {error instanceof Error ? error.message : "Unknown error"}
                    </span>
                  </div>
                </td>
              </tr>
            )}

            {isMounted && !isLoading && !isError && filteredReports?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-gray-500">
                  No reports found matching your criteria.
                </td>
              </tr>
            )}

            {isMounted &&
              !isLoading &&
              !isError &&
              filteredReports?.map((report) => (
                <tr key={report.id} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 shrink-0 text-cyan-400" />
                      <span className="font-semibold text-gray-200">{report.title}</span>
                    </div>
                    <p className="mt-1 pl-7 text-xs text-gray-600">{report.summary}</p>
                  </td>
                  <td className="px-5 py-4 text-gray-400">{report.industry}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-[11px] font-semibold tracking-wider ${
                        report.status === "PUBLISHED"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : report.status === "DRAFT"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                      }`}
                    >
                      {report.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-500">{report.region ?? "-"}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <label className="cursor-pointer text-gray-400 hover:text-cyan-400">
                        {uploadPdfMutation.isPending && selectedReportId === report.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                        <input
                          type="file"
                          accept="application/pdf"
                          className="hidden"
                          onChange={(e) => handleFileUpload(report.id, e)}
                        />
                      </label>

                      <button
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this report?")) {
                            deleteMutation.mutate(report.id);
                          }
                        }}
                        disabled={deleteMutation.isPending}
                        className="text-gray-400 hover:text-red-400 disabled:opacity-40"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Page {page}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={!isMounted ? true : page === 1 || isLoading}
            className="rounded border border-white/[0.08] px-3 py-1.5 hover:bg-white/[0.05] disabled:opacity-40"
          >
            Previous
          </button>
          <button
            onClick={() => setPage((prev) => prev + 1)}
            disabled={
              !isMounted ? true : !data?.reports || data.reports.length < limit || isLoading
            }
            className="rounded border border-white/[0.08] px-3 py-1.5 hover:bg-white/[0.05] disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      {/* Create Report Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border border-white/[0.1] bg-neutral-950 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Create New Market Report</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-gray-400">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q3 Tech Investment Report"
                  value={newReport.title}
                  onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
                  className="mt-1 w-full rounded border border-white/[0.08] bg-black/40 px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400">Category</label>
                <select
                  value={newReport.categoryId}
                  onChange={(e) => setNewReport({ ...newReport, categoryId: e.target.value })}
                  className="mt-1 w-full rounded border border-white/[0.08] bg-black/40 px-3 py-2 text-sm text-gray-200 focus:border-cyan-400 focus:outline-none"
                >
                  <option value="">Select a Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400">Industry *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Renewable Energy"
                  value={newReport.industry}
                  onChange={(e) => setNewReport({ ...newReport, industry: e.target.value })}
                  className="mt-1 w-full rounded border border-white/[0.08] bg-black/40 px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400">Region</label>
                <input
                  type="text"
                  placeholder="e.g. Global, North America"
                  value={newReport.region}
                  onChange={(e) => setNewReport({ ...newReport, region: e.target.value })}
                  className="mt-1 w-full rounded border border-white/[0.08] bg-black/40 px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400">Summary *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Brief high-level summary..."
                  value={newReport.summary}
                  onChange={(e) => setNewReport({ ...newReport, summary: e.target.value })}
                  className="mt-1 w-full rounded border border-white/[0.08] bg-black/40 px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="inline-flex items-center gap-2 rounded bg-cyan-500 px-4 py-2 text-xs font-semibold text-black hover:bg-cyan-400 disabled:opacity-50"
                >
                  {createMutation.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                  Save Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
