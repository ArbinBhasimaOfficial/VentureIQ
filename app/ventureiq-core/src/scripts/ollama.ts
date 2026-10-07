const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";

const EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL || "nomic-embed-text";
const CHAT_MODEL = process.env.OLLAMA_CHAT_MODEL || "llama3";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_EMBED_MODEL = process.env.OPENAI_EMBED_MODEL || "text-embedding-3-small";
const OPENAI_CHAT_MODEL = process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_EMBED_MODEL = process.env.GEMINI_EMBED_MODEL || "gemini-embedding-001";
const GEMINI_CHAT_MODEL = process.env.GEMINI_CHAT_MODEL || "gemini-flash-lite-latest";

// Embed via OpenAI when a key is configured, otherwise via local Ollama.
export async function embed(text: string): Promise<number[]> {
  if (GEMINI_API_KEY) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_EMBED_MODEL}:embedContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: `models/${GEMINI_EMBED_MODEL}`,
          content: { parts: [{ text }] },
          outputDimensionality: 768,
        }),
      },
    );

    if (!res.ok) {
      throw new Error(`Gemini embeddings failed: ${res.status} ${await res.text()}`);
    }

    const data = (await res.json()) as { embedding: { values: number[] } };
    return data.embedding.values;
  }

  if (OPENAI_API_KEY) {
    const res = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({ model: OPENAI_EMBED_MODEL, input: text, dimensions: 768 }),
    });

    if (!res.ok) {
      throw new Error(`OpenAI embeddings failed: ${res.status} ${await res.text()}`);
    }

    const data = (await res.json()) as { data: { embedding: number[] }[] };
    return data.data[0]?.embedding ?? [];
  }

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
  if (GEMINI_API_KEY) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_CHAT_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      },
    );

    if (!res.ok) {
      throw new Error(`Gemini generate failed: ${res.status} ${await res.text()}`);
    }

    const data = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  }

  if (OPENAI_API_KEY) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_CHAT_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
      }),
    });

    if (!res.ok) {
      throw new Error(`OpenAI chat failed: ${res.status} ${await res.text()}`);
    }

    const data = (await res.json()) as { choices: { message: { content: string } }[] };
    return data.choices[0]?.message.content ?? "";
  }

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
