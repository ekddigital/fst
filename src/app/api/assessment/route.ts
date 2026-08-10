import { assessmentSchema } from "@/lib/validations/forms";
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

  const parsed = assessmentSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Validation failed", parsed.error.flatten().fieldErrors);
  }

  if (!isDatabaseConfigured()) {
    console.warn(JSON.stringify({ level: "warn", message: "DATABASE_URL not configured", requestId }));
    return serviceUnavailable("Assessment submissions are not configured yet. Please contact Teacher Joe directly.");
  }

  try {
    const submission = await db.assessmentSubmission.create({
      data: {
        studentName: parsed.data.studentName,
        parentEmail: parsed.data.parentEmail,
        answers: parsed.data.answers,
      },
    });
    return apiSuccess({ id: submission.id, requestId }, 201);
  } catch (err) {
    console.error(JSON.stringify({ level: "error", message: "Assessment submission failed", requestId, err }));
    return serverError();
  }
}
