"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FolderTree, Plus, Trash2 } from "lucide-react";

import { getDashboardCategories } from "@/lib/api/dashboard";
import { createCategory, deleteCategory } from "@/lib/api/adminCrud";

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const categories = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: getDashboardCategories,
  });
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const create = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      setName("");
      setDescription("");
    },
  });
  const remove = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "categories"] }),
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

      <form
        className="flex flex-wrap gap-3 border border-white/[0.06] bg-white/[0.02] p-5"
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate({ name, description });
        }}
      >
        <input
          className="flex-1 rounded border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm"
          placeholder="Category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="flex-1 rounded border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button className="inline-flex items-center gap-2 rounded bg-cyan-400 px-4 py-2 text-xs font-bold uppercase text-[#050a0b]">
          <Plus className="h-4 w-4" /> Add
        </button>
      </form>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {categories.data?.map((category) => (
          <article key={category.id} className="border border-white/[0.06] bg-white/[0.02] p-5">
            <div className="flex items-start justify-between">
              <FolderTree className="h-5 w-5 text-cyan-400" />
              <button
                onClick={() => remove.mutate(category.id)}
                className="text-gray-600 hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <h2 className="mt-6 font-semibold">{category.name}</h2>
            <p className="mt-2 text-xs text-gray-600">{category.description ?? "No description"}</p>
            <p className="mt-5 text-[10px] font-mono text-gray-700">{category.slug}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
