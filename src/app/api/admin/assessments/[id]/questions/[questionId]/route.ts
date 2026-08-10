import { Prisma } from "@prisma/client";
import { apiSuccess, badRequest, notFound } from "@/lib/api/response";
import { runAdminRoute } from "@/lib/api/admin-route";
import { db } from "@/lib/db";
import { questionUpdateSchema } from "@/lib/validations/admin";

type RouteContext = { params: Promise<{ id: string; questionId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  return runAdminRoute(request, async (req, requestId) => {
    const { id, questionId } = await context.params;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return badRequest("Invalid JSON body", undefined, requestId);
    }

    const parsed = questionUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Validation failed", parsed.error.flatten().fieldErrors, requestId);
    }

    const existing = await db.assessmentQuestion.findFirst({
      where: { id: questionId, assessmentId: id },
    });
    if (!existing) return notFound(undefined, requestId);

    const question = await db.assessmentQuestion.update({
      where: { id: questionId },
      data: {
        ...parsed.data,
        options:
          parsed.data.options === null
            ? Prisma.JsonNull
            : parsed.data.options === undefined
              ? undefined
              : parsed.data.options,
      },
    });

    return apiSuccess({ question, requestId }, 200, requestId);
  });
}

export async function DELETE(request: Request, context: RouteContext) {
  return runAdminRoute(request, async (_req, requestId) => {
    const { id, questionId } = await context.params;

    const existing = await db.assessmentQuestion.findFirst({
      where: { id: questionId, assessmentId: id },
    });
    if (!existing) return notFound(undefined, requestId);

    await db.assessmentQuestion.delete({ where: { id: questionId } });
    return apiSuccess({ deleted: true, id: questionId, requestId }, 200, requestId);
  });
}
