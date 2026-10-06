"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDownRight, ArrowUpRight, Minus, Plus, Trash2 } from "lucide-react";

import { getDashboardCategories, getDashboardTrends } from "@/lib/api/dashboard";
import { createTrend, deleteTrend } from "@/lib/api/adminCrud";

export default function AdminTrendsPage() {
  const queryClient = useQueryClient();
  const trends = useQuery({ queryKey: ["admin", "trends"], queryFn: getDashboardTrends });
  const categories = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: getDashboardCategories,
  });
  const icons = { RISING: ArrowUpRight, FALLING: ArrowDownRight, STABLE: Minus } as const;

  const [form, setForm] = useState({
    title: "",
    description: "",
    industry: "",
    direction: "STABLE" as const,
    categoryId: "",
  });
  const create = useMutation({
    mutationFn: createTrend,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "trends"] });
      setForm({ title: "", description: "", industry: "", direction: "STABLE", categoryId: "" });
    },
  });
  const remove = useMutation({
    mutationFn: deleteTrend,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "trends"] }),
  });

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
          className="rounded border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm sm:col-span-2"
          placeholder="Description (min 10)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
        />
        <select
          className="rounded border border-white/[0.08] bg-[#0a0f12] px-3 py-2 text-sm"
          value={form.direction}
          onChange={(e) => setForm({ ...form, direction: e.target.value as typeof form.direction })}
        >
          <option value="RISING">Rising</option>
          <option value="FALLING">Falling</option>
          <option value="STABLE">Stable</option>
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
          <Plus className="h-4 w-4" /> Add trend
        </button>
      </form>

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
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
                    {trend.industry}
                  </span>
                  <button
                    onClick={() => remove.mutate(trend.id)}
                    className="text-gray-600 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
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
