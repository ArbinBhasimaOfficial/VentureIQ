"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Plus, Trash2 } from "lucide-react";

import { createResearch, deleteResearch, getResearch } from "@/lib/api/research";

export default function AdminResearchPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    summary: "",
    content: "",
    type: "ARTICLE" as const,
    status: "DRAFT" as const,
  });

  const research = useQuery({
    queryKey: ["admin", "research"],
    queryFn: () => getResearch({ page: 1, limit: 50 }),
  });

  const create = useMutation({
    mutationFn: createResearch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "research"] });
      setShowForm(false);
      setForm({ title: "", summary: "", content: "", type: "ARTICLE", status: "DRAFT" });
    },
  });

  const remove = useMutation({
    mutationFn: deleteResearch,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "research"] }),
  });

  return (
    <div className="space-y-7">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-400">
            Content operations
          </p>
          <h1 className="mt-3 text-3xl font-bold">Research</h1>
          <p className="mt-3 text-sm text-gray-500">
            Publish and manage research articles and whitepapers.
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-[#050a0b]"
        >
          <Plus className="h-4 w-4" /> New research
        </button>
      </header>

      {showForm && (
        <form
          className="space-y-4 border border-white/[0.06] bg-white/[0.02] p-5"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate(form);
          }}
        >
          <input
            className="w-full rounded border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <input
            className="w-full rounded border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm"
            placeholder="Summary (min 10 chars)"
            value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
            required
          />
          <textarea
            className="w-full rounded border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm"
            placeholder="Content (min 20 chars)"
            rows={4}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            required
          />
          <div className="flex gap-3">
            <select
              className="rounded border border-white/[0.08] bg-[#0a0f12] px-3 py-2 text-sm"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as typeof form.type })}
            >
              <option value="ARTICLE">Article</option>
              <option value="CASE_STUDY">Case Study</option>
              <option value="WHITEPAPER">Whitepaper</option>
              <option value="COMMENTARY">Commentary</option>
            </select>
            <select
              className="rounded border border-white/[0.08] bg-[#0a0f12] px-3 py-2 text-sm"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as typeof form.status })}
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
            <button
              type="submit"
              className="rounded bg-cyan-400 px-4 py-2 text-xs font-bold uppercase text-[#050a0b]"
            >
              {create.isPending ? "Saving..." : "Save"}
            </button>
          </div>
          {create.isError && <p className="text-sm text-red-300">Failed to create research.</p>}
        </form>
      )}

      <div className="overflow-x-auto border border-white/[0.06]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/[0.06] text-[10px] uppercase tracking-widest text-gray-600">
            <tr>
              <th className="px-5 py-4">Title</th>
              <th className="px-5 py-4">Type</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {research.data?.research.map((item) => (
              <tr key={item.id}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-cyan-400" />
                    <span className="font-semibold text-gray-200">{item.title}</span>
                  </div>
                  <p className="mt-1 pl-7 text-xs text-gray-600">{item.summary}</p>
                </td>
                <td className="px-5 py-4 text-gray-400">{item.type}</td>
                <td className="px-5 py-4">
                  <span
                    className={
                      item.status === "PUBLISHED"
                        ? "text-emerald-400"
                        : item.status === "DRAFT"
                          ? "text-amber-400"
                          : "text-gray-600"
                    }
                  >
                    {item.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <button
                    onClick={() => remove.mutate(item.id)}
                    className="text-gray-600 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {!research.data?.research.length && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-sm text-gray-600">
                  No research yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
