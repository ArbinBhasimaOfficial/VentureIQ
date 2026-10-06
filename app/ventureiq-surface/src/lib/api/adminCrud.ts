import apiClient from "./client";

// Categories
export async function createCategory(input: { name: string; description?: string }) {
  const r = await apiClient.post("/v1/categories", input);
  return r.data;
}
export async function updateCategory(id: string, input: { name?: string; description?: string }) {
  const r = await apiClient.patch(`/v1/categories/${id}`, input);
  return r.data;
}
export async function deleteCategory(id: string) {
  await apiClient.delete(`/v1/categories/${id}`);
}

// Trends
export async function createTrend(input: {
  title: string;
  description: string;
  industry: string;
  direction?: "RISING" | "FALLING" | "STABLE";
  categoryId: string;
}) {
  const r = await apiClient.post("/v1/trends", input);
  return r.data;
}
export async function updateTrend(id: string, input: Record<string, unknown>) {
  const r = await apiClient.patch(`/v1/trends/${id}`, input);
  return r.data;
}
export async function deleteTrend(id: string) {
  await apiClient.delete(`/v1/trends/${id}`);
}

// Reports
export async function updateReport(id: string, input: Record<string, unknown>) {
  const r = await apiClient.patch(`/v1/reports/${id}`, input);
  return r.data;
}
export async function deleteReport(id: string) {
  await apiClient.delete(`/v1/reports/${id}`);
}
export async function createReport(input: {
  title: string;
  summary: string;
  content: string;
  industry: string;
  region?: string;
  categoryId: string;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}) {
  const r = await apiClient.post("/v1/reports", input);
  return r.data;
}

// Datasets
export async function createDataset(input: {
  name: string;
  description?: string;
  source?: string;
  reportId: string;
  data: unknown;
}) {
  const r = await apiClient.post("/v1/datasets", input);
  return r.data;
}
export async function updateDataset(id: string, input: Record<string, unknown>) {
  const r = await apiClient.patch(`/v1/datasets/${id}`, input);
  return r.data;
}
export async function deleteDataset(id: string) {
  await apiClient.delete(`/v1/datasets/${id}`);
}

// Companies
export async function createCompany(input: {
  name: string;
  description?: string;
  website?: string;
  headquarters?: string;
  foundedYear?: number;
}) {
  const r = await apiClient.post("/v1/companies", input);
  return r.data;
}
export async function updateCompany(id: string, input: Record<string, unknown>) {
  const r = await apiClient.patch(`/v1/companies/${id}`, input);
  return r.data;
}
export async function deleteCompany(id: string) {
  await apiClient.delete(`/v1/companies/${id}`);
}
