"use client";

import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { FileUp, Upload } from "lucide-react";

import { getFilesForReport, getFilesForResearch, uploadFile } from "@/lib/api/uploads";

export default function AdminUploadsPage() {
  const [reportId, setReportId] = useState("");
  const [researchId, setResearchId] = useState("");
  const [files, setFiles] = useState<Awaited<ReturnType<typeof getFilesForReport>>>([]);
  const [loaded, setLoaded] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const load = async () => {
    if (reportId.trim()) {
      const list = await getFilesForReport(reportId.trim());
      setFiles(list);
      setLoaded(true);
    } else if (researchId.trim()) {
      const list = await getFilesForResearch(researchId.trim());
      setFiles(list);
      setLoaded(true);
    }
  };

  const upload = useMutation({
    mutationFn: (file: File) =>
      uploadFile(file, reportId.trim() || undefined, researchId.trim() || undefined),
    onSuccess: (record) => setFiles((current) => [record, ...current]),
  });

  return (
    <div className="space-y-7">
      <header>
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-400">
          Content operations
        </p>
        <h1 className="mt-3 text-3xl font-bold">Uploads</h1>
        <p className="mt-3 text-sm text-gray-500">
          Upload PDFs attached to a report and view its files.
        </p>
      </header>

      <div className="space-y-4 border border-white/[0.06] bg-white/[0.02] p-5">
        <input
          className="w-full rounded border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm"
          placeholder="Report ID (optional)"
          value={reportId}
          onChange={(e) => setReportId(e.target.value)}
        />
        <input
          className="w-full rounded border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm"
          placeholder="Research ID (optional)"
          value={researchId}
          onChange={(e) => setResearchId(e.target.value)}
        />
        <div className="flex gap-3">
          <button
            onClick={load}
            className="rounded border border-white/[0.1] px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-cyan-300"
          >
            Load files
          </button>
          <input
            ref={fileInput}
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) upload.mutate(file);
              e.target.value = "";
            }}
          />
          <button
            onClick={() => fileInput.current?.click()}
            disabled={upload.isPending}
            className="inline-flex items-center gap-2 rounded bg-cyan-400 px-4 py-2 text-xs font-bold uppercase text-[#050a0b] disabled:opacity-50"
          >
            <Upload className="h-4 w-4" /> {upload.isPending ? "Uploading..." : "Upload PDF"}
          </button>
        </div>
        {upload.isError && <p className="text-sm text-red-300">Upload failed.</p>}
      </div>

      <div className="border border-white/[0.06]">
        {loaded && files.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-gray-600">No files for this report.</p>
        )}
        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.05]"
          >
            <FileUp className="h-4 w-4 text-cyan-400" />
            <div className="flex-1">
              <p className="text-sm text-gray-200">{file.originalName}</p>
              <p className="text-xs text-gray-600">
                {file.mimeType} · {(file.size / 1024).toFixed(0)} KB
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
