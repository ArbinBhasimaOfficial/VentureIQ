export function chunkText(text: string, chunkSize = 1200, overlap = 200): string[] {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return [];

  const chunks: string[] = [];
  let start = 0;

  while (start < cleaned.length) {
    let end = Math.min(start + chunkSize, cleaned.length);

    // try to end on a sentence boundary
    if (end < cleaned.length) {
      const lastPeriod = cleaned.lastIndexOf(". ", end);
      if (lastPeriod > start + chunkSize / 2) {
        end = lastPeriod + 2;
      }
    }

    chunks.push(cleaned.slice(start, end).trim());
    if (end >= cleaned.length) break;
    start = Math.max(end - overlap, start + 1);
  }

  return chunks.filter((c) => c.length > 50);
}
