"use client";

import { useState } from "react";
import { Download, Eye } from "lucide-react";

import { downloadUpload, getPdfUrl } from "@/lib/api/uploads";

export default function PdfLink({ id, name, size }: { id: string; name: string; size: number }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState<string | null>(null);

  const toggle = async () => {
    if (!open && !url) {
      const u = await getPdfUrl(id);
      setUrl(u);
    }
    setOpen((v) => !v);
  };

  return (
    <li className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => downloadUpload(id, name)}
          className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 hover:underline"
        >
          <Download className="h-4 w-4" /> {name}
          <span className="text-xs text-gray-600">({(size / 1024).toFixed(0)} KB)</span>
        </button>
        <button
          onClick={toggle}
          className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-cyan-300"
        >
          <Eye className="h-3.5 w-3.5" /> {open ? "Hide" : "View"}
        </button>
      </div>
      {open && url && (
        <iframe
          src={url}
          title={name}
          className="h-[600px] w-full rounded border border-white/[0.06]"
        />
      )}
    </li>
  );
}
