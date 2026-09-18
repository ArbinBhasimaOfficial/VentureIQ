"use client";

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";

import type { ReportChartData } from "@/lib/report-demo-data";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
);

const chartColors = ["#22d3ee", "#38bdf8", "#818cf8", "#34d399", "#fbbf24", "#fb7185"];

const commonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { color: "#9ca3af", boxWidth: 10, padding: 18, font: { size: 10 } },
    },
    tooltip: {
      backgroundColor: "#111827",
      borderColor: "rgba(34, 211, 238, 0.25)",
      borderWidth: 1,
      titleColor: "#f3f4f6",
      bodyColor: "#9ca3af",
    },
  },
  scales: {
    x: {
      ticks: { color: "#6b7280", font: { size: 10 } },
      grid: { color: "rgba(255,255,255,0.05)" },
    },
    y: {
      ticks: { color: "#6b7280", font: { size: 10 } },
      grid: { color: "rgba(255,255,255,0.05)" },
    },
  },
};

export default function ReportCharts({ data }: { data: ReportChartData }) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
      <div className="min-h-[320px] border border-white/[0.06] bg-white/[0.02] p-5">
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
            Composition
          </p>
          <h3 className="mt-1 text-sm font-semibold text-gray-200">Audience segments</h3>
        </div>
        <div className="h-[245px]">
          <Doughnut
            data={{
              labels: data.segments.map((point) => point.label),
              datasets: [
                {
                  data: data.segments.map((point) => point.value),
                  backgroundColor: chartColors,
                  borderColor: "#050a0b",
                  borderWidth: 3,
                },
              ],
            }}
            options={{ ...commonOptions, scales: undefined }}
          />
        </div>
      </div>

      <div className="min-h-[320px] border border-white/[0.06] bg-white/[0.02] p-5">
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">Momentum</p>
          <h3 className="mt-1 text-sm font-semibold text-gray-200">Signal over time</h3>
        </div>
        <div className="h-[245px]">
          <Line
            data={{
              labels: data.trend.map((point) => point.label),
              datasets: [
                {
                  label: "Signal index",
                  data: data.trend.map((point) => point.value),
                  borderColor: "#22d3ee",
                  backgroundColor: "rgba(34,211,238,0.12)",
                  fill: true,
                  tension: 0.35,
                  pointRadius: 3,
                  pointBackgroundColor: "#22d3ee",
                },
              ],
            }}
            options={commonOptions}
          />
        </div>
      </div>

      <div className="min-h-[320px] border border-white/[0.06] bg-white/[0.02] p-5 xl:col-span-2">
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
            Acquisition mix
          </p>
          <h3 className="mt-1 text-sm font-semibold text-gray-200">Channel contribution</h3>
        </div>
        <div className="h-[245px]">
          <Bar
            data={{
              labels: data.channels.map((point) => point.label),
              datasets: [
                {
                  label: "Share",
                  data: data.channels.map((point) => point.value),
                  backgroundColor: chartColors,
                  borderRadius: 3,
                  maxBarThickness: 42,
                },
              ],
            }}
            options={commonOptions}
          />
        </div>
      </div>
    </div>
  );
}
