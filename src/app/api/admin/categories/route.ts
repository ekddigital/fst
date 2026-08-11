import { apiSuccess, badRequest, validationError, created } from "@/lib/api/response";
import { runAdminRoute } from "@/lib/api/admin-route";
import { db } from "@/lib/db";
import { categoryCreateSchema } from "@/lib/validations/admin";

export async function GET(request: Request) {
  return runAdminRoute(request, async (_req, requestId) => {
    const categories = await db.resourceCategory.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { resources: true } } },
    });
    return apiSuccess({ categories, requestId }, 200, requestId);
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

    const parsed = categoryCreateSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.flatten().fieldErrors, requestId);
    }

    const maxOrder = await db.resourceCategory.aggregate({ _max: { sortOrder: true } });
    const sortOrder = parsed.data.sortOrder ?? (maxOrder._max.sortOrder ?? 0) + 1;

    const category = await db.resourceCategory.create({
      data: { ...parsed.data, sortOrder },
    });

    return created({ category, requestId }, requestId);
  });
}
