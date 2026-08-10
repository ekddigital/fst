import { apiSuccess, badRequest, created } from "@/lib/api/response";
import { runAdminRoute } from "@/lib/api/admin-route";
import { db } from "@/lib/db";
import { resourceCreateSchema, resourceListQuerySchema } from "@/lib/validations/admin";

export async function GET(request: Request) {
  return runAdminRoute(request, async (req, requestId) => {
    const params = Object.fromEntries(new URL(req.url).searchParams);
    const query = resourceListQuerySchema.safeParse(params);
    if (!query.success) {
      return badRequest("Validation failed", query.error.flatten().fieldErrors, requestId);
    }

    const resources = await db.resource.findMany({
      where: query.data.categoryId ? { categoryId: query.data.categoryId } : undefined,
      orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
      include: { category: { select: { id: true, title: true, slug: true } } },
    });

    return apiSuccess({ resources, requestId }, 200, requestId);
  });
}

export async function POST(request: Request) {
  return runAdminRoute(request, async (req, requestId) => {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return badRequest("Invalid JSON body", undefined, requestId);
    }

    const parsed = resourceCreateSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Validation failed", parsed.error.flatten().fieldErrors, requestId);
    }

    const category = await db.resourceCategory.findUnique({
      where: { id: parsed.data.categoryId },
    });
    if (!category) {
      return badRequest("Category not found", { categoryId: ["Invalid category"] }, requestId);
    }

    const maxOrder = await db.resource.aggregate({
      where: { categoryId: parsed.data.categoryId },
      _max: { sortOrder: true },
    });
    const sortOrder = parsed.data.sortOrder ?? (maxOrder._max.sortOrder ?? 0) + 1;

    const resource = await db.resource.create({
      data: { ...parsed.data, sortOrder },
    });

    return created({ resource, requestId }, requestId);
  });
}
