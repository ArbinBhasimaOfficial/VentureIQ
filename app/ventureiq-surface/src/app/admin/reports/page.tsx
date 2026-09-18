"use client";

import { useQuery } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import { getDashboardReports } from "@/lib/api/dashboard";

export default function AdminReportsPage() {
  const reports = useQuery({
    queryKey: ["admin", "reports"],
    queryFn: () => getDashboardReports(1, 50),
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
      <div className="overflow-x-auto border border-white/[0.06]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/[0.06] text-[10px] uppercase tracking-widest text-gray-600">
            <tr>
              <th className="px-5 py-4">Report</th>
              <th className="px-5 py-4">Industry</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Region</th>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
