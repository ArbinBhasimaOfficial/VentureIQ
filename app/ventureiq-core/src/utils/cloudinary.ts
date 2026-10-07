import fs from "node:fs/promises";
import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

const enabled = Boolean(cloudName && apiKey && apiSecret);

if (enabled) {
  cloudinary.config({ cloud_name: cloudName!, api_key: apiKey!, api_secret: apiSecret! });
}

export function isCloudinaryEnabled() {
  return enabled;
}

export async function uploadToCloudinary(localPath: string, publicId: string): Promise<string | null> {
  if (!enabled) return null;

  const result = await cloudinary.uploader.upload(localPath, {
    resource_type: "raw",
    public_id: publicId,
    folder: "ventureiq",
  });

  await fs.unlink(localPath).catch(() => {});

  return result.secure_url;
}

export async function deleteFromCloudinary(urlOrPublicId: string): Promise<void> {
  if (!enabled) return;

  let publicId = urlOrPublicId;

  if (urlOrPublicId.startsWith("http")) {
    const parts = urlOrPublicId.split("/");
    const filename = parts[parts.length - 1] ?? "";
    publicId = `ventureiq/${filename.replace(/\.[^.]+$/, "")}`;
  }

  await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
}

export async function getDownloadUrl(url: string): Promise<string> {
  return url; // Cloudinary secure_url is directly downloadable
}
