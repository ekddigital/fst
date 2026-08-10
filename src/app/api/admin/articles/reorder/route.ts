import { apiSuccess, badRequest, notFound } from "@/lib/api/response";
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
      return badRequest("Validation failed", parsed.error.flatten().fieldErrors, requestId);
    }

    const existing = await db.article.findMany({
      where: { id: { in: parsed.data.ids } },
      select: { id: true },
    });

    if (existing.length !== parsed.data.ids.length) {
      return notFound("One or more articles not found.", requestId);
    }

    await reorderByIds(parsed.data.ids, (id, sortOrder) =>
      db.article.update({ where: { id }, data: { sortOrder } }),
    );

    const articles = await db.article.findMany({
      orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }],
    });
    return apiSuccess({ articles, requestId }, 200, requestId);
  });
}
