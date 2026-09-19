// src/lib/api/dashboard.ts

import apiClient from "./client";

export type DashboardReport = {
  id: string;
  title: string;
  summary: string;
  content?: string;
  categoryId: string;
  industry: string;
  region: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  createdAt: string;
};

export type DashboardCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

export type DashboardTrend = {
  id: string;
  title: string;
  description: string;
  industry: string;
  direction: "RISING" | "FALLING" | "STABLE";
  createdAt: string;
};

export type DashboardCompany = {
  id: string;
  name: string;
  description: string | null;
  website: string | null;
  headquarters: string | null;
  foundedYear: number | null;
};

export type DashboardAlert = {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export type DashboardDataset = {
  id: string;
  name: string;
  description: string | null;
  data: unknown;
  source: string | null;
  reportId: string;
  createdAt: string;
};

type ReportsResponse = {
  reports: DashboardReport[];
  pagination: { page: number; limit: number; count: number; total: number; totalPages: number };
};

type TrendsResponse = {
  data: {
    trends: DashboardTrend[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  };
};

type CompaniesResponse = {
  companies: DashboardCompany[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

type AlertsResponse = {
  alerts: DashboardAlert[];
  unreadCount: number;
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

/* ==========================================================================
   GETTERS
   ========================================================================== */

export async function getDashboardReports(page = 1, limit = 12, industry?: string) {
  const response = await apiClient.get<ReportsResponse>("/reports", {
    params: { page, limit, ...(industry ? { industry } : {}) },
  });

  return response.data;
}

export async function getDashboardReport(reportId: string) {
  const response = await apiClient.get<{ status: string; data: DashboardReport }>(
    `/reports/${reportId}`,
  );

  return response.data.data;
}

export async function getDashboardCategories() {
  const response = await apiClient.get<{ data: DashboardCategory[] }>("/categories");

  return response.data.data;
}

export async function getDashboardTrends() {
  const response = await apiClient.get<TrendsResponse>("/trends", {
    params: { page: 1, limit: 50 },
  });

  return response.data.data;
}

export async function getDashboardCompanies() {
  const response = await apiClient.get<CompaniesResponse>("/companies", {
    params: { page: 1, limit: 50 },
  });

  return response.data;
}

export async function getReportDatasets(reportId: string) {
  const response = await apiClient.get<{
    datasets: DashboardDataset[];
    pagination: { page: number; limit: number; count: number };
  }>("/datasets", {
    params: { page: 1, limit: 50, reportId },
  });

  return response.data.datasets;
}

export async function getDashboardAlerts() {
  const response = await apiClient.get<AlertsResponse>("/alerts", {
    params: { page: 1, limit: 5, unreadOnly: true },
  });

  return response.data;
}

/* ==========================================================================
   ADMIN MUTATIONS
   ========================================================================== */

export async function createMarketReport(data: {
  title: string;
  summary: string;
  industry: string;
  region?: string;
  categoryId?: string;
}) {
  // Correct path matches app.use("/api/v1/reports", reportRoutes)
  const response = await apiClient.post<{ data: DashboardReport }>("/reports", data);
  return response.data;
}

export async function uploadMarketReportPdf(id: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post<{ message: string; pdfUrl: string }>(
    `/reports/${id}/pdf`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
}

export async function removeMarketReport(id: string) {
  const response = await apiClient.delete<{ success: boolean; message: string }>(`/reports/${id}`);

  return response.data;
}
