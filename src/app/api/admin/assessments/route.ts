import { apiSuccess, badRequest, validationError, created } from "@/lib/api/response";
import { runAdminRoute } from "@/lib/api/admin-route";
import { db } from "@/lib/db";
import { assessmentCreateSchema } from "@/lib/validations/admin";

export async function GET(request: Request) {
  return runAdminRoute(request, async (_req, requestId) => {
    const assessments = await db.assessment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { questions: true, submissions: true } },
      },
    });
    return apiSuccess({ assessments, requestId }, 200, requestId);
  });
}

export async function POST(request: Request) {
  return runAdminRoute(request, async (req, requestId) => {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return badRequest("Invalid JSON body", undefined, requestId);
    }

    const parsed = assessmentCreateSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.flatten().fieldErrors, requestId);
    }

    const assessment = await db.assessment.create({ data: parsed.data });
    return created({ assessment, requestId }, requestId);
  });
}
