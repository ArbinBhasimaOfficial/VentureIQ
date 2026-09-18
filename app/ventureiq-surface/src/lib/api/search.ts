import apiClient from "./client";

export type SearchResultType = "REPORT" | "TREND" | "RESEARCH";

export type SearchResult = {
  resultType: SearchResultType;
  document: Record<string, unknown>;
  relevanceScore: number;
};

export type SearchResponse = {
  status: string;
  data: SearchResult[];
  cached: boolean;
};

export async function searchDocuments(
  query: string,
  types: SearchResultType[] = ["REPORT", "TREND", "RESEARCH"],
  limit = 8,
) {
  const response = await apiClient.get<SearchResponse>("/api/search", {
    params: {
      q: query,
      limit,
      types: types.join(","),
    },
  });

  return response.data;
}
