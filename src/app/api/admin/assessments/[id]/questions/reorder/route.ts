import { apiSuccess, badRequest, validationError, notFound } from "@/lib/api/response";
import { runAdminRoute } from "@/lib/api/admin-route";
import { reorderByIds } from "@/lib/data/reorder";
import { db } from "@/lib/db";
import { reorderIdsSchema } from "@/lib/validations/admin";

type RouteContext = { params: Promise<{ id: string }> };

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

    const parsed = reorderIdsSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.flatten().fieldErrors, requestId);
    }

    const existing = await db.assessmentQuestion.findMany({
      where: { id: { in: parsed.data.ids }, assessmentId: id },
      select: { id: true },
    });

    if (existing.length !== parsed.data.ids.length) {
      return notFound("One or more questions not found.", requestId);
    }

    await reorderByIds(parsed.data.ids, (qid, sortOrder) =>
      db.assessmentQuestion.update({ where: { id: qid }, data: { sortOrder } }),
    );

    const questions = await db.assessmentQuestion.findMany({
      where: { assessmentId: id },
      orderBy: { sortOrder: "asc" },
    });

    return apiSuccess({ questions, requestId }, 200, requestId);
  });
}
