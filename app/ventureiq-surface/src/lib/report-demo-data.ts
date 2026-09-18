export type ChartPoint = {
  label: string;
  value: number;
};

export type ReportChartData = {
  segments: ChartPoint[];
  trend: ChartPoint[];
  channels: ChartPoint[];
  source: "backend" | "demo";
};

export const demoReportData: ReportChartData = {
  segments: [
    { label: "Enterprise", value: 38 },
    { label: "Mid-market", value: 27 },
    { label: "SMB", value: 21 },
    { label: "Public sector", value: 14 },
  ],
  trend: [
    { label: "Jan", value: 42 },
    { label: "Feb", value: 49 },
    { label: "Mar", value: 55 },
    { label: "Apr", value: 51 },
    { label: "May", value: 68 },
    { label: "Jun", value: 77 },
  ],
  channels: [
    { label: "Direct", value: 46 },
    { label: "Partner", value: 29 },
    { label: "Search", value: 17 },
    { label: "Other", value: 8 },
  ],
  source: "demo",
};

function asNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, "").match(/-?\d+(?:\.\d+)?/)?.[0]);

    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function asPoint(value: unknown, index: number): ChartPoint | null {
  if (!value || typeof value !== "object") return null;

  const row = value as Record<string, unknown>;
  const label = row.label ?? row.name ?? row.category ?? row.month ?? `Item ${index + 1}`;
  const numericValue = row.value ?? row.count ?? row.total ?? row.amount;
  const parsedValue = asNumber(numericValue);

  if (parsedValue === null) return null;

  return { label: String(label), value: parsedValue };
}

function rowsFrom(value: unknown) {
  if (Array.isArray(value)) {
    return value.map(asPoint).filter((point): point is ChartPoint => point !== null);
  }

  if (value && typeof value === "object") {
    return Object.entries(value)
      .map(([label, rawValue]) => {
        const numericValue = asNumber(rawValue);

        return numericValue === null ? null : { label, value: numericValue };
      })
      .filter((point): point is ChartPoint => point !== null);
  }

  return [];
}

export function normalizeReportData(value: unknown): ReportChartData {
  if (!value || typeof value !== "object") return demoReportData;

  const record = value as Record<string, unknown>;
  const segments = rowsFrom(record.segments ?? record.categories ?? record.segmentBreakdown);
  const trend = rowsFrom(record.trend ?? record.timeline ?? record.monthly);
  const channels = rowsFrom(record.channels ?? record.sources ?? record.channelBreakdown);

  if (segments.length || trend.length || channels.length) {
    return {
      segments: segments.length ? segments : demoReportData.segments,
      trend: trend.length ? trend : demoReportData.trend,
      channels: channels.length ? channels : demoReportData.channels,
      source: "backend",
    };
  }

  const rows = rowsFrom(Array.isArray(value) ? value : (record.rows ?? value));

  if (!rows.length) return demoReportData;

  return {
    segments: rows.slice(0, 6),
    trend: rows.slice(0, 8),
    channels: rows.slice(0, 6),
    source: "backend",
  };
}

export function makeDownloadPayload(
  report: { id: string; title: string; industry: string; region: string | null },
  data: ReportChartData,
) {
  return {
    report: {
      id: report.id,
      title: report.title,
      industry: report.industry,
      region: report.region,
    },
    generatedAt: new Date().toISOString(),
    source: data.source,
    charts: data,
  };
}
