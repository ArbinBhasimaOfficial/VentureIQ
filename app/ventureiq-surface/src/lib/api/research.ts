import apiClient from "./client";

export type ResearchItem = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  type: "ARTICLE" | "CASE_STUDY" | "WHITEPAPER" | "COMMENTARY";
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  categoryId: string | null;
  createdAt: string;
};

export type ResearchListResponse = {
  status: string;
  data: {
    research: ResearchItem[];
    pagination: { page: number; limit: number; count: number };
  };
};

export async function getResearch(params: { page?: number; limit?: number; type?: string } = {}) {
  const response = await apiClient.get<ResearchListResponse>("/v1/research", { params });
  return response.data.data;
}

export async function createResearch(input: {
  title: string;
  summary: string;
  content: string;
  type?: ResearchItem["type"];
  status?: ResearchItem["status"];
  categoryId?: string;
}) {
  const response = await apiClient.post("/v1/research", input);
  return response.data;
}

export async function deleteResearch(id: string) {
  await apiClient.delete(`/v1/research/${id}`);
}
