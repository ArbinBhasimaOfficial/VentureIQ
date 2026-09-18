import apiClient from "./client";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  isActive: boolean;
  createdAt: string;
};

export async function getAdminUsers(
  params: { page?: number; limit?: number; search?: string; role?: "USER" | "ADMIN" } = {},
) {
  const response = await apiClient.get<{
    users: AdminUser[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }>("/api/admin/users", { params });
  return response.data;
}

export async function updateAdminUserRole(id: string, role: AdminUser["role"]) {
  const response = await apiClient.patch<{ data: AdminUser }>(`/api/admin/users/${id}/role`, {
    role,
  });
  return response.data.data;
}

export async function setAdminUserActive(id: string, active: boolean) {
  const response = await apiClient.patch<{ data: AdminUser }>(
    `/api/admin/users/${id}/${active ? "reactivate" : "deactivate"}`,
  );
  return response.data.data;
}

export async function getAdminAnalytics() {
  const [overview, categories, industries, publishing] = await Promise.all([
    apiClient.get<{ data: Record<string, number> }>("/api/analytics/overview"),
    apiClient.get<{ data: { categoryName: string; reportCount: number }[] }>(
      "/api/analytics/reports-by-category",
    ),
    apiClient.get<{ data: { industry: string; reportCount: number }[] }>(
      "/api/analytics/reports-by-industry",
    ),
    apiClient.get<{ data: { month: string; count: number }[] }>(
      "/api/analytics/publishing-trend?months=12",
    ),
  ]);

  return {
    overview: overview.data.data,
    categories: categories.data.data,
    industries: industries.data.data,
    publishing: publishing.data.data,
  };
}
