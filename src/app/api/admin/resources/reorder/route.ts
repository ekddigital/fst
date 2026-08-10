import { apiSuccess, badRequest, notFound } from "@/lib/api/response";
import { runAdminRoute } from "@/lib/api/admin-route";
import { reorderByIds } from "@/lib/data/reorder";
import { db } from "@/lib/db";
import { resourceReorderSchema } from "@/lib/validations/admin";

export async function POST(request: Request) {
  return runAdminRoute(request, async (req, requestId) => {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return badRequest("Invalid JSON body", undefined, requestId);
    }

    const parsed = resourceReorderSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Validation failed", parsed.error.flatten().fieldErrors, requestId);
    }

    const existing = await db.resource.findMany({
      where: { id: { in: parsed.data.ids }, categoryId: parsed.data.categoryId },
      select: { id: true },
    });

    if (existing.length !== parsed.data.ids.length) {
      return notFound("One or more resources not found in this category.", requestId);
    }

    await reorderByIds(parsed.data.ids, (id, sortOrder) =>
      db.resource.update({ where: { id }, data: { sortOrder } }),
    );

    const resources = await db.resource.findMany({
      where: { categoryId: parsed.data.categoryId },
      orderBy: { sortOrder: "asc" },
    });

    return apiSuccess({ resources, requestId }, 200, requestId);
  });
}
