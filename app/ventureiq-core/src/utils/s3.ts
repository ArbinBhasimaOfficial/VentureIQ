import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import fs from "node:fs/promises";

const REGION = process.env.AWS_REGION || "us-east-1";
const BUCKET = process.env.AWS_S3_BUCKET;
const ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID;
const SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY;

const enabled = Boolean(BUCKET && ACCESS_KEY && SECRET_KEY);

const client = enabled
  ? new S3Client({ region: REGION, credentials: { accessKeyId: ACCESS_KEY!, secretAccessKey: SECRET_KEY! } })
  : null;

export function isS3Enabled() {
  return enabled;
}

export async function uploadToS3(localPath: string, key: string, contentType: string): Promise<string | null> {
  if (!client || !BUCKET) return null;

  const body = await fs.readFile(localPath);
  await client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );

  await fs.unlink(localPath).catch(() => {});

  return `s3://${BUCKET}/${key}`;
}

export async function getPresignedUrl(s3Uri: string, expiresIn = 3600): Promise<string> {
  if (!client || !BUCKET) throw new Error("S3 is not configured");

  const key = s3Uri.startsWith("s3://") ? s3Uri.split("/").slice(3).join("/") : s3Uri;
  const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
  const { GetObjectCommand } = await import("@aws-sdk/client-s3");

  return getSignedUrl(client, new GetObjectCommand({ Bucket: BUCKET, Key: key }), { expiresIn });
}

export async function deleteFromS3(keyOrUrl: string): Promise<void> {
  if (!client || !BUCKET) return;

  const key = keyOrUrl.startsWith("s3://") ? keyOrUrl.split("/").slice(3).join("/") : keyOrUrl;

  await client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}
