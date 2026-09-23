// src/lib/api/search.ts
export type SearchResultType = "REPORT" | "TREND" | "RESEARCH";

export async function searchDocuments(query: string, types: SearchResultType[]) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1570";

  const params = new URLSearchParams({
    q: query,
    limit: "8",
  });

  if (types.length > 0) {
    params.append("types", types.join(",")); // Sends ?types=REPORT,TREND,RESEARCH
  }

  const res = await fetch(`${baseUrl}/api/v1/search?${params.toString()}`);

  if (!res.ok) {
    throw new Error("Failed to fetch search results");
  }

  return res.json();
}
