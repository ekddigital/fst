import { apiSuccess, badRequest, validationError, created } from "@/lib/api/response";
import { runAdminRoute } from "@/lib/api/admin-route";
import { buildPaginationMeta, paginationSkip, parsePagination } from "@/lib/data/pagination";
import { db } from "@/lib/db";
import { resourceCreateSchema, resourceListQuerySchema } from "@/lib/validations/admin";

export async function GET(request: Request) {
  return runAdminRoute(request, async (req, requestId) => {
    const url = new URL(req.url);
    const params = Object.fromEntries(url.searchParams);
    const query = resourceListQuerySchema.safeParse(params);
    if (!query.success) {
      return validationError(query.error.flatten().fieldErrors, requestId);
    }
    const { page, pageSize } = parsePagination(url.searchParams);
    const where = query.data.categoryId ? { categoryId: query.data.categoryId } : {};

    const [total, resources] = await Promise.all([
      db.resource.count({ where }),
      db.resource.findMany({
        where,
        orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
        include: { category: { select: { id: true, title: true, slug: true } } },
        skip: paginationSkip(page, pageSize),
        take: pageSize,
      }),
    ]);

    return apiSuccess(
      { resources, pagination: buildPaginationMeta(total, page, pageSize), requestId },
      200,
      requestId,
    );
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
      return validationError(parsed.error.flatten().fieldErrors, requestId);
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
