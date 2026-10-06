"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Sparkles, Send, Loader2 } from "lucide-react";

import { askRag } from "@/lib/api/rag";

export default function AskPage() {
  const [question, setQuestion] = useState("");
  const ask = useMutation({
    mutationFn: (q: string) => askRag(q),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = question.trim();
    if (q.length >= 3 && !ask.isPending) {
      ask.mutate(q);
    }
  };

  return (
    <div className="space-y-8">
      <header className="border-b border-white/[0.06] pb-7">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-400">
          Ask VentureIQ
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-100">
          Ask the intelligence
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
          Ask natural-language questions about your reports, trends, and research. Answers are
          grounded in the indexed documents and cite their sources.
        </p>
      </header>

      <form onSubmit={submit} className="flex gap-3">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. What are the top food trends in Nepal?"
          className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-gray-100 placeholder:text-gray-600 focus:border-cyan-500/50 focus:outline-none"
        />
        <button
          type="submit"
          disabled={ask.isPending || question.trim().length < 3}
          className="inline-flex items-center gap-2 rounded-lg bg-cyan-500/90 px-5 py-3 text-sm font-semibold text-black transition hover:bg-cyan-400 disabled:opacity-40"
        >
          {ask.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Ask
        </button>
      </form>

      {ask.isError && (
        <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          The assistant is unavailable right now. Check that the Core API and Ollama are running.
        </p>
      )}

      {ask.isSuccess && (
        <section className="space-y-5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
          <div className="flex items-center gap-2 text-cyan-400">
            <Sparkles className="h-4 w-4" />
            <h2 className="text-sm font-bold uppercase tracking-widest">Answer</h2>
          </div>
          <p className="whitespace-pre-wrap text-sm leading-7 text-gray-200">{ask.data.answer}</p>

          {ask.data.sources.length > 0 && (
            <div className="border-t border-white/[0.06] pt-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Sources</h3>
              <ul className="mt-3 space-y-2">
                {ask.data.sources.map((source) => (
                  <li
                    key={`${source.sourceType}-${source.sourceId}`}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-300">{source.title ?? "Untitled"}</span>
                    <span className="text-xs text-gray-600">
                      {source.sourceType} · {(source.score * 100).toFixed(0)}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
