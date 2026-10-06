"use client";

import { useQuery } from "@tanstack/react-query";
import { FileText, FileUp } from "lucide-react";

import { getResearch } from "@/lib/api/research";
import { getFilesForResearch } from "@/lib/api/uploads";
import PdfLink from "@/components/dashboard/PdfLink";

function ResearchItem({
  item,
}: {
  item: Awaited<ReturnType<typeof getResearch>>["research"][number];
}) {
  const files = useQuery({
    queryKey: ["research-files", item.id],
    queryFn: () => getFilesForResearch(item.id),
  });

  return (
    <article className="border border-white/[0.06] bg-white/[0.02] p-5">
      <h2 className="font-semibold text-gray-100">{item.title}</h2>
      <p className="mt-2 text-sm text-gray-500">{item.summary}</p>
      <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-cyan-400">
        {item.type} · {item.status}
      </p>

      <div className="mt-4 border-t border-white/[0.06] pt-4">
        {files.data?.length ? (
          <ul className="space-y-2">
            {files.data.map((file) => (
              <PdfLink key={file.id} id={file.id} name={file.originalName} size={file.size} />
            ))}
          </ul>
        ) : (
          <p className="text-xs text-gray-600">No files attached yet.</p>
        )}
      </div>
    </article>
  );
}

export default function ResearchPage() {
  const research = useQuery({
    queryKey: ["dashboard", "research"],
    queryFn: () => getResearch({ page: 1, limit: 50 }),
  });

  return (
    <div className="space-y-8">
      <header className="border-b border-white/[0.06] pb-7">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-400">
          Research library
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-100">Research</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
          Whitepapers, case studies, and articles. Uploaded PDFs appear here and can be downloaded.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        {research.data?.research.map((item) => (
          <ResearchItem key={item.id} item={item} />
        ))}
        {!research.data?.research.length && (
          <p className="text-sm text-gray-600">No research published yet.</p>
        )}
      </div>
    </div>
  );
}
