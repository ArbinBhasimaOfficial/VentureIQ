"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronDown, FileText, FlaskConical, Search, TrendingUp, X } from "lucide-react";
import { useDeferredValue, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { searchDocuments, type SearchResultType } from "@/lib/api/search";

const SEARCH_TYPES: { value: SearchResultType; label: string }[] = [
  { value: "REPORT", label: "Reports" },
  { value: "TREND", label: "Trends" },
  { value: "RESEARCH", label: "Research" },
];

const resultIcons = {
  REPORT: FileText,
  TREND: TrendingUp,
  RESEARCH: FlaskConical,
};

function getDocumentText(document: Record<string, unknown>, key: string) {
  return typeof document[key] === "string" ? document[key] : "";
}

export default function DashboardSearch() {
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<SearchResultType[]>(
    SEARCH_TYPES.map((type) => type.value),
  );
  const deferredQuery = useDeferredValue(query.trim());
  const search = useQuery({
    queryKey: ["dashboard-search", deferredQuery, selectedTypes],
    queryFn: () => searchDocuments(deferredQuery, selectedTypes),
    enabled: deferredQuery.length >= 2 && selectedTypes.length > 0,
    staleTime: 60_000,
  });

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const toggleType = (type: SearchResultType) => {
    setSelectedTypes((current) =>
      current.includes(type) ? current.filter((item) => item !== type) : [...current, type],
    );
  };

  const openResult = (result: {
    resultType: SearchResultType;
    document: Record<string, unknown>;
  }) => {
    const id = getDocumentText(result.document, "id");
    const destination =
      result.resultType === "REPORT"
        ? `/dashboard/reports/${encodeURIComponent(id)}`
        : result.resultType === "TREND"
          ? `/dashboard/markets?trend=${encodeURIComponent(id)}`
          : "/dashboard/markets";
    setIsOpen(false);
    router.push(destination);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-xl">
      <div
        className={`flex items-center gap-2 border bg-white/[0.03] px-3 py-2 transition-colors ${isOpen ? "border-cyan-400/40" : "border-white/[0.06]"}`}
      >
        <Search className="h-4 w-4 shrink-0 text-gray-600" aria-hidden="true" />
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setIsOpen(false);
          }}
          placeholder="Search reports, trends, research..."
          aria-label="Search reports, trends, and research"
          className="min-w-0 flex-1 bg-transparent text-xs text-gray-200 outline-none placeholder:text-gray-700"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="text-gray-600 hover:text-gray-300"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        <div className="hidden items-center gap-1 border-l border-white/[0.08] pl-2 sm:flex">
          {SEARCH_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => toggleType(type.value)}
              className={`rounded px-1.5 py-1 text-[9px] font-bold uppercase tracking-wider transition-colors ${selectedTypes.includes(type.value) ? "bg-cyan-400/10 text-cyan-400" : "text-gray-700 hover:text-gray-500"}`}
            >
              {type.label.slice(0, 1)}
            </button>
          ))}
        </div>
      </div>

      {isOpen && deferredQuery.length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden border border-white/[0.08] bg-[#0b1113] shadow-2xl shadow-black/30">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-400">
              BM25 results
            </span>
            {search.data && (
              <span className="text-[10px] text-gray-600">
                {search.data.cached ? "cached" : "live"}
              </span>
            )}
          </div>
          {search.isFetching && (
            <p className="px-4 py-5 text-xs text-gray-600">Ranking documents...</p>
          )}
          {search.isError && (
            <p className="px-4 py-5 text-xs text-red-300">
              Search is unavailable. Check that the local Core API is running.
            </p>
          )}
          {!search.isFetching && search.data?.data.length === 0 && (
            <p className="px-4 py-5 text-xs text-gray-600">
              No indexed documents matched this query.
            </p>
          )}
          {!search.isFetching &&
            search.data?.data.map((result) => {
              const Icon = resultIcons[result.resultType];
              const title =
                getDocumentText(result.document, "title") ||
                getDocumentText(result.document, "name") ||
                "Untitled document";
              const description =
                getDocumentText(result.document, "summary") ||
                getDocumentText(result.document, "description");
              const status = getDocumentText(result.document, "status");
              const industry = getDocumentText(result.document, "industry");
              const region = getDocumentText(result.document, "region");
              const metadata = [result.resultType, status, industry, region]
                .filter(Boolean)
                .join(" · ");
              return (
                <button
                  key={`${result.resultType}-${getDocumentText(result.document, "id")}`}
                  type="button"
                  onClick={() => openResult(result)}
                  className="flex w-full items-start gap-3 border-b border-white/[0.05] px-4 py-3 text-left transition-colors last:border-0 hover:bg-cyan-400/[0.06]"
                >
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-3">
                      <span className="truncate text-xs font-semibold text-gray-200">{title}</span>
                      <span className="shrink-0 text-[10px] font-mono text-gray-600">
                        {result.relevanceScore.toFixed(2)}
                      </span>
                    </span>
                    <span className="mt-1 block truncate text-[10px] uppercase tracking-wider text-gray-600">
                      {metadata}
                      {description ? ` · ${description}` : ""}
                    </span>
                  </span>
                </button>
              );
            })}
          {selectedTypes.length === 0 && (
            <p className="px-4 py-4 text-[10px] text-amber-300">Select at least one result type.</p>
          )}
          <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-2 sm:hidden">
            <span className="text-[10px] text-gray-600">Filter results</span>
            <ChevronDown className="h-3 w-3 text-gray-600" aria-hidden="true" />
          </div>
        </div>
      )}
    </div>
  );
}
