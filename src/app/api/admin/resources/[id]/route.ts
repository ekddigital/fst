import { apiSuccess, badRequest, validationError, notFound } from "@/lib/api/response";
import { runAdminRoute } from "@/lib/api/admin-route";
import { db } from "@/lib/db";
import { resourceUpdateSchema } from "@/lib/validations/admin";

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

    const parsed = resourceUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.flatten().fieldErrors, requestId);
    }

    const existing = await db.resource.findUnique({ where: { id } });
    if (!existing) return notFound(undefined, requestId);

    const resource = await db.resource.update({
      where: { id },
      data: parsed.data,
    });

    return apiSuccess({ resource, requestId }, 200, requestId);
  });
}

export async function DELETE(request: Request, context: RouteContext) {
  return runAdminRoute(request, async (_req, requestId) => {
    const { id } = await context.params;

    const existing = await db.resource.findUnique({ where: { id } });
    if (!existing) return notFound(undefined, requestId);

    await db.resource.delete({ where: { id } });
    return apiSuccess({ deleted: true, id, requestId }, 200, requestId);
  });
}
