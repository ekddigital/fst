import { contactSchema } from "@/lib/validations/forms";
import { db, isDatabaseConfigured } from "@/lib/db";
import {
  apiSuccess,
  badRequest,
  resolveRequestId,
  serverError,
  serviceUnavailable,
} from "@/lib/api/response";

export async function POST(request: Request) {
  const requestId = resolveRequestId(request.headers.get("x-request-id"));

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Validation failed", parsed.error.flatten().fieldErrors);
  }

  if (!isDatabaseConfigured()) {
    console.warn(JSON.stringify({ level: "warn", message: "DATABASE_URL not configured", requestId }));
    return serviceUnavailable("Contact form is not configured yet. Please email Teacher Joe directly.");
  }

  try {
    const submission = await db.contactSubmission.create({ data: parsed.data });
    return apiSuccess({ id: submission.id, requestId }, 201);
  } catch (err) {
    console.error(JSON.stringify({ level: "error", message: "Contact submission failed", requestId, err }));
    return serverError();
  }
}
