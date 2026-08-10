import { apiSuccess, badRequest, notFound } from "@/lib/api/response";
import { runAdminRoute } from "@/lib/api/admin-route";
import { db } from "@/lib/db";
import { articleUpdateSchema } from "@/lib/validations/admin";

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

    const parsed = articleUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Validation failed", parsed.error.flatten().fieldErrors, requestId);
    }

    const existing = await db.article.findUnique({ where: { id } });
    if (!existing) return notFound(undefined, requestId);

    const { publishedAt, ...rest } = parsed.data;
    const data = {
      ...rest,
      ...(publishedAt !== undefined && {
        publishedAt: publishedAt ? new Date(publishedAt) : null,
      }),
    };

    const article = await db.article.update({
      where: { id },
      data,
    });

    return apiSuccess({ article, requestId }, 200, requestId);
  });
}

export async function DELETE(request: Request, context: RouteContext) {
  return runAdminRoute(request, async (_req, requestId) => {
    const { id } = await context.params;

    const existing = await db.article.findUnique({ where: { id } });
    if (!existing) return notFound(undefined, requestId);

    await db.article.delete({ where: { id } });
    return apiSuccess({ deleted: true, id, requestId }, 200, requestId);
  });
}
