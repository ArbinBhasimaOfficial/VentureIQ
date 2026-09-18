"use client";

import { useQuery } from "@tanstack/react-query";
import { FolderTree } from "lucide-react";
import { getDashboardCategories } from "@/lib/api/dashboard";

export default function AdminCategoriesPage() {
  const categories = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: getDashboardCategories,
  });
  return (
    <div className="space-y-7">
      <header>
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-400">
          Taxonomy operations
        </p>
        <h1 className="mt-3 text-3xl font-bold">Categories</h1>
        <p className="mt-3 text-sm text-gray-500">
          Manage the taxonomy used to organize reports and signals.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {categories.data?.map((category) => (
          <article key={category.id} className="border border-white/[0.06] bg-white/[0.02] p-5">
            <FolderTree className="h-5 w-5 text-cyan-400" />
            <h2 className="mt-6 font-semibold">{category.name}</h2>
            <p className="mt-2 text-xs text-gray-600">{category.description ?? "No description"}</p>
            <p className="mt-5 text-[10px] font-mono text-gray-700">{category.slug}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
