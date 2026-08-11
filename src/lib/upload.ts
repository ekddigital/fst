import { randomBytes } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

export type UploadKind = "images" | "videos" | "other";

const MAX_BYTES: Record<UploadKind, number> = {
  images: 10 * 1024 * 1024,
  videos: 500 * 1024 * 1024,
  other: 25 * 1024 * 1024,
};

const IMAGE_EXT = /\.(jpe?g|png|webp|gif)$/i;
const VIDEO_EXT = /\.(mp4|webm|mov|m4v)$/i;
const DOC_EXT = /\.(pdf|docx?)$/i;

export function detectUploadKind(filename: string, mimeType?: string): UploadKind | null {
  const mime = mimeType?.toLowerCase() ?? "";
  if (mime.startsWith("image/") || IMAGE_EXT.test(filename)) return "images";
  if (mime.startsWith("video/") || VIDEO_EXT.test(filename)) return "videos";
  if (mime === "application/pdf" || mime.includes("word") || DOC_EXT.test(filename)) return "other";
  return null;
}

export function sanitizeFilename(name: string): string {
  const base = path.basename(name).replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
  return base.slice(0, 120) || "file";
}

export function generatePublicPath(kind: UploadKind, originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  const stem = sanitizeFilename(path.basename(originalName, ext));
  const unique = `${Date.now()}-${randomBytes(4).toString("hex")}-${stem}${ext}`;
  return `/${kind}/${unique}`;
}

export function maxUploadBytes(kind: UploadKind): number {
  return MAX_BYTES[kind];
}

export async function saveUploadedFile(
  file: File,
  preferredKind?: UploadKind,
): Promise<{ url: string; kind: UploadKind }> {
  const kind = detectUploadKind(file.name, file.type);
  if (!kind) {
    throw new Error("Unsupported file type. Use JPEG, PNG, WebP, GIF, MP4, WebM, PDF, or Word.");
  }
  if (preferredKind && preferredKind !== kind) {
    throw new Error(`Expected a ${preferredKind.slice(0, -1)} file but received a different type.`);
  }
  if (file.size > MAX_BYTES[kind]) {
    const maxMb = Math.round(MAX_BYTES[kind] / (1024 * 1024));
    throw new Error(`File is too large. Maximum size is ${maxMb} MB.`);
  }
  if (file.size === 0) {
    throw new Error("File is empty.");
  }

  const publicPath = generatePublicPath(kind, file.name);
  const absolutePath = path.join(process.cwd(), "public", publicPath.slice(1));
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(absolutePath, buffer);

  return { url: publicPath, kind };
}
