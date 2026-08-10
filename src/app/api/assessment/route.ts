import { assessmentApiSchema } from "@/lib/validations/forms";
import { db } from "@/lib/db";
import {
  apiSuccess,
  badRequest,
  resolveRequestId,
  serverError,
  serviceUnavailable,
  tooManyRequests,
} from "@/lib/api/response";
import { checkRateLimit, rateLimitKey } from "@/lib/api/rate-limit";
import { validatePostRequest } from "@/lib/api/request-guard";
import { isDatabaseConfigured } from "@/lib/db";
import { scoreAssessmentSubmission } from "@/lib/data/catalog";

export async function POST(request: Request) {
  const requestId = resolveRequestId(request.headers.get("x-request-id"));

  const guard = validatePostRequest(request);
  if (!guard.ok) {
    return badRequest(guard.message, undefined, requestId);
  }

  const limit = checkRateLimit(rateLimitKey(request, "assessment"));
  if (!limit.allowed) {
    return tooManyRequests(limit.retryAfterSec ?? 60, requestId);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body", undefined, requestId);
  }

  const parsed = assessmentApiSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Validation failed", parsed.error.flatten().fieldErrors, requestId);
  }

  if (!isDatabaseConfigured()) {
    console.warn(
      JSON.stringify({ level: "warn", message: "DATABASE_URL not configured", requestId, route: "assessment" }),
    );
    return serviceUnavailable(
      "Assessment submissions are not configured yet. Please contact Teacher Joe directly.",
      requestId,
    );
  }

  const { assessmentId, studentName, parentEmail, age, answers } = parsed.data;

  try {
    const assessment = await db.assessment.findUnique({
      where: { id: assessmentId, published: true },
      include: { questions: true },
    });

    if (!assessment) {
      return badRequest("Assessment not found", { assessmentId: ["Invalid assessment"] }, requestId);
    }

    const questionIds = assessment.questions.map((q) => q.id);
    const missing = questionIds.filter((id) => !answers[id]?.trim());
    if (missing.length > 0) {
      return badRequest("Validation failed", {
        answers: ["Please answer all questions before submitting"],
      }, requestId);
    }

    const scored = await scoreAssessmentSubmission(assessmentId, answers);
    if (!scored) {
      return serverError(undefined, requestId);
    }

    const submission = await db.assessmentSubmission.create({
      data: {
        assessmentId,
        studentName,
        parentEmail: parentEmail ?? null,
        age: age ?? null,
        answers,
        score: scored.score,
        maxScore: scored.maxScore,
      },
    });

    return apiSuccess(
      {
        id: submission.id,
        score: scored.score,
        maxScore: scored.maxScore,
        requestId,
      },
      201,
      requestId,
    );
  } catch (err) {
    console.error(
      JSON.stringify({ level: "error", message: "Assessment submission failed", requestId, route: "assessment", err }),
    );
    return serverError(undefined, requestId);
  }
}
