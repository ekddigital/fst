import { apiSuccess, badRequest, validationError, notFound } from "@/lib/api/response";
import { runAdminRoute } from "@/lib/api/admin-route";
import { db } from "@/lib/db";
import { categoryUpdateSchema } from "@/lib/validations/admin";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  return runAdminRoute(request, async (req, requestId) => {
    const { id } = await context.params;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return badRequest("Invalid JSON body", undefined, requestId);
    }

    const parsed = categoryUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.flatten().fieldErrors, requestId);
    }

    const existing = await db.resourceCategory.findUnique({ where: { id } });
    if (!existing) return notFound(undefined, requestId);

    const category = await db.resourceCategory.update({
      where: { id },
      data: parsed.data,
    });

    return apiSuccess({ category, requestId }, 200, requestId);
  });
}

export async function DELETE(request: Request, context: RouteContext) {
  return runAdminRoute(request, async (_req, requestId) => {
    const { id } = await context.params;

    const existing = await db.resourceCategory.findUnique({ where: { id } });
    if (!existing) return notFound(undefined, requestId);

    await db.resourceCategory.delete({ where: { id } });
    return apiSuccess({ deleted: true, id, requestId }, 200, requestId);
  });
}
