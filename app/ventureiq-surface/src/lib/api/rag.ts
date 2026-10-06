import apiClient from "./client";

export type RagSource = {
  title: string | null;
  sourceType: "REPORT" | "TREND" | "RESEARCH";
  sourceId: string;
  score: number;
};

export type RagAnswer = {
  answer: string;
  sources: RagSource[];
};

export async function askRag(question: string): Promise<RagAnswer> {
  const response = await apiClient.post<{ status: string; data: RagAnswer }>("/v1/rag/ask", {
    question,
  });

  return response.data.data;
}
