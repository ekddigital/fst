import { apiSuccess, badRequest, validationError, notFound } from "@/lib/api/response";
import { runAdminRoute } from "@/lib/api/admin-route";
import { reorderByIds } from "@/lib/data/reorder";
import { db } from "@/lib/db";
import { reorderIdsSchema } from "@/lib/validations/admin";

export async function POST(request: Request) {
  return runAdminRoute(request, async (req, requestId) => {
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

    const existing = await db.resourceCategory.findMany({
      where: { id: { in: parsed.data.ids } },
      select: { id: true },
    });

    if (existing.length !== parsed.data.ids.length) {
      return notFound("One or more categories not found.", requestId);
    }

    await reorderByIds(parsed.data.ids, (id, sortOrder) =>
      db.resourceCategory.update({ where: { id }, data: { sortOrder } }),
    );

    const categories = await db.resourceCategory.findMany({ orderBy: { sortOrder: "asc" } });
    return apiSuccess({ categories, requestId }, 200, requestId);
  });
}
