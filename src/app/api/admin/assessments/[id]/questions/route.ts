import { apiSuccess, badRequest, validationError, created, notFound } from "@/lib/api/response";
import { runAdminRoute } from "@/lib/api/admin-route";
import { db } from "@/lib/db";
import { questionCreateSchema } from "@/lib/validations/admin";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  return runAdminRoute(request, async (_req, requestId) => {
    const { id } = await context.params;

    const assessment = await db.assessment.findUnique({ where: { id } });
    if (!assessment) return notFound(undefined, requestId);

    const questions = await db.assessmentQuestion.findMany({
      where: { assessmentId: id },
      orderBy: { sortOrder: "asc" },
    });

    return apiSuccess({ questions, requestId }, 200, requestId);
  });
}

export async function POST(request: Request, context: RouteContext) {
  return runAdminRoute(request, async (req, requestId) => {
    const { id } = await context.params;

    const assessment = await db.assessment.findUnique({ where: { id } });
    if (!assessment) return notFound(undefined, requestId);

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return badRequest("Invalid JSON body", undefined, requestId);
    }

    const parsed = questionCreateSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.flatten().fieldErrors, requestId);
    }

    const maxOrder = await db.assessmentQuestion.aggregate({
      where: { assessmentId: id },
      _max: { sortOrder: true },
    });
    const sortOrder = parsed.data.sortOrder ?? (maxOrder._max.sortOrder ?? 0) + 1;

    const question = await db.assessmentQuestion.create({
      data: {
        assessmentId: id,
        section: parsed.data.section,
        sortOrder,
        prompt: parsed.data.prompt,
        type: parsed.data.type,
        options: parsed.data.options ?? undefined,
        correctAnswer: parsed.data.correctAnswer ?? null,
        points: parsed.data.points ?? 1,
      },
    });

    return created({ question, requestId }, requestId);
  });
}
