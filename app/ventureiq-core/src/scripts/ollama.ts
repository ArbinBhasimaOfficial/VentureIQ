const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
export const EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL || "nomic-embed-text";
export const CHAT_MODEL = process.env.OLLAMA_CHAT_MODEL || "llama3";

export async function embed(text: string): Promise<number[]> {
  const res = await fetch(`${OLLAMA_URL}/api/embeddings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: EMBED_MODEL, prompt: text }),
  });

  if (!res.ok) {
    throw new Error(`Ollama embeddings failed: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as { embedding: number[] };
  return data.embedding;
}

export async function generate(prompt: string): Promise<string> {
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: CHAT_MODEL, prompt, stream: false }),
  });

  if (!res.ok) {
    throw new Error(`Ollama generate failed: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as { response: string };
  return data.response;
}
