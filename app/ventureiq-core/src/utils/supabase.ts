import fs from "node:fs/promises";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SERVICE_ROLE_KEY || process.env.ANON_KEY;
const BUCKET = process.env.SUPABASE_BUCKET || "pdfs";

const enabled = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export function isSupabaseEnabled() {
  return enabled;
}

export async function uploadToSupabase(localPath: string, filename: string, contentType: string): Promise<string | null> {
  if (!enabled) return null;

  const buffer = await fs.readFile(localPath);

  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${filename}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY!,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": contentType,
      "x-upsert": "true",
    },
    body: buffer,
  });

  if (!res.ok) {
    throw new Error(`Supabase upload failed: ${res.status} ${await res.text()}`);
  }

  await fs.unlink(localPath).catch(() => {});

  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${filename}`;
}

export async function deleteFromSupabase(fileUrl: string): Promise<void> {
  if (!enabled) return;

  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const idx = fileUrl.indexOf(marker);
  const filename = idx >= 0 ? fileUrl.slice(idx + marker.length) : fileUrl;

  await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${filename}`, {
    method: "DELETE",
    headers: {
      apikey: SUPABASE_ANON_KEY!,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
}
