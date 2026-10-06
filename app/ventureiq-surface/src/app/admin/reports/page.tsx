"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Plus, Trash2 } from "lucide-react";

import { getDashboardCategories, getDashboardReports } from "@/lib/api/dashboard";
import { createReport, deleteReport } from "@/lib/api/adminCrud";

export default function AdminReportsPage() {
  const queryClient = useQueryClient();
  const reports = useQuery({
    queryKey: ["admin", "reports"],
    queryFn: () => getDashboardReports(1, 50),
  });
  const categories = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: getDashboardCategories,
  });

  const [form, setForm] = useState({
    title: "",
    summary: "",
    content: "",
    industry: "",
    region: "",
    categoryId: "",
    status: "DRAFT" as const,
  });
  const create = useMutation({
    mutationFn: createReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });
      setForm({
        title: "",
        summary: "",
        content: "",
        industry: "",
        region: "",
        categoryId: "",
        status: "DRAFT",
      });
    },
  });
  const remove = useMutation({
    mutationFn: deleteReport,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "reports"] }),
  });

  return (
    <div className="space-y-7">
      <header>
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-400">
          Content operations
        </p>
        <h1 className="mt-3 text-3xl font-bold">Reports</h1>
        <p className="mt-3 text-sm text-gray-500">
          Review every report, including drafts and archived records.
        </p>
      </header>

      <form
        className="grid gap-3 border border-white/[0.06] bg-white/[0.02] p-5 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate(form);
        }}
      >
        <input
          className="rounded border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <input
          className="rounded border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm"
          placeholder="Industry"
          value={form.industry}
          onChange={(e) => setForm({ ...form, industry: e.target.value })}
          required
        />
        <input
          className="rounded border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm"
          placeholder="Summary (min 10)"
          value={form.summary}
          onChange={(e) => setForm({ ...form, summary: e.target.value })}
          required
        />
        <input
          className="rounded border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm"
          placeholder="Region (optional)"
          value={form.region}
          onChange={(e) => setForm({ ...form, region: e.target.value })}
        />
        <textarea
          className="rounded border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm sm:col-span-2"
          placeholder="Content (min 20)"
          rows={3}
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          required
        />
        <select
          className="rounded border border-white/[0.08] bg-[#0a0f12] px-3 py-2 text-sm"
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value as typeof form.status })}
        >
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <select
          className="rounded border border-white/[0.08] bg-[#0a0f12] px-3 py-2 text-sm"
          value={form.categoryId}
          onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          required
        >
          <option value="">Select category</option>
          {categories.data?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button className="inline-flex items-center justify-center gap-2 rounded bg-cyan-400 px-4 py-2 text-xs font-bold uppercase text-[#050a0b] sm:col-span-2">
          <Plus className="h-4 w-4" /> Create report
        </button>
        {create.isError && (
          <p className="text-sm text-red-300 sm:col-span-2">Failed to create report.</p>
        )}
      </form>

      <div className="overflow-x-auto border border-white/[0.06]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/[0.06] text-[10px] uppercase tracking-widest text-gray-600">
            <tr>
              <th className="px-5 py-4">Report</th>
              <th className="px-5 py-4">Industry</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Region</th>
              <th className="px-5 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {reports.data?.reports.map((report) => (
              <tr key={report.id}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-cyan-400" />
                    <span className="font-semibold text-gray-200">{report.title}</span>
                  </div>
                  <p className="mt-1 pl-7 text-xs text-gray-600">{report.summary}</p>
                </td>
                <td className="px-5 py-4 text-gray-400">{report.industry}</td>
                <td className="px-5 py-4">
                  <span
                    className={
                      report.status === "PUBLISHED"
                        ? "text-emerald-400"
                        : report.status === "DRAFT"
                          ? "text-amber-400"
                          : "text-gray-600"
                    }
                  >
                    {report.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-gray-500">{report.region ?? "-"}</td>
                <td className="px-5 py-4 text-right">
                  <button
                    onClick={() => remove.mutate(report.id)}
                    className="text-gray-600 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
