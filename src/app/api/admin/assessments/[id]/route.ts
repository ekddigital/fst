import { apiSuccess, badRequest, validationError, notFound } from "@/lib/api/response";
import { runAdminRoute } from "@/lib/api/admin-route";
import { db } from "@/lib/db";
import { assessmentUpdateSchema } from "@/lib/validations/admin";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  return runAdminRoute(request, async (_req, requestId) => {
    const { id } = await context.params;

    const assessment = await db.assessment.findUnique({
      where: { id },
      include: {
        questions: { orderBy: { sortOrder: "asc" } },
        _count: { select: { submissions: true } },
      },
    });

    if (!assessment) return notFound(undefined, requestId);
    return apiSuccess({ assessment, requestId }, 200, requestId);
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  return runAdminRoute(request, async (req, requestId) => {
    const { id } = await context.params;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return badRequest("Invalid JSON body", undefined, requestId);
    }

    const parsed = assessmentUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.flatten().fieldErrors, requestId);
    }

    const existing = await db.assessment.findUnique({ where: { id } });
    if (!existing) return notFound(undefined, requestId);

    const assessment = await db.assessment.update({
      where: { id },
      data: parsed.data,
    });

    return apiSuccess({ assessment, requestId }, 200, requestId);
  });
}

export async function DELETE(request: Request, context: RouteContext) {
  return runAdminRoute(request, async (_req, requestId) => {
    const { id } = await context.params;

    const existing = await db.assessment.findUnique({ where: { id } });
    if (!existing) return notFound(undefined, requestId);

    await db.assessment.delete({ where: { id } });
    return apiSuccess({ deleted: true, id, requestId }, 200, requestId);
  });
}
