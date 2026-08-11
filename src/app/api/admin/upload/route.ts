import { created, badRequest } from "@/lib/api/response";
import { runAdminRoute } from "@/lib/api/admin-route";
import { saveUploadedFile } from "@/lib/upload";
import { z } from "zod";

const kindSchema = z.enum(["images", "videos", "other"]).optional();

export async function POST(request: Request) {
  return runAdminRoute(request, async (req, requestId) => {
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return badRequest("Expected multipart form data with a file.", undefined, requestId);
    }

    const file = formData.get("file");
    if (!(file instanceof File)) {
      return badRequest("Missing file. Choose a file to upload.", undefined, requestId);
    }

    const kindRaw = formData.get("kind");
    const kindParsed = kindSchema.safeParse(typeof kindRaw === "string" ? kindRaw : undefined);
    const preferredKind = kindParsed.success ? kindParsed.data : undefined;

    try {
      const saved = await saveUploadedFile(file, preferredKind);
      return created({ url: saved.url, kind: saved.kind, requestId }, requestId);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed.";
      return badRequest(message, undefined, requestId);
    }
  });
}

export const runtime = "nodejs";
