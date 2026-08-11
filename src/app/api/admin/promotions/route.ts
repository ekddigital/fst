import { apiSuccess, badRequest, validationError, created } from "@/lib/api/response";
import { runAdminRoute } from "@/lib/api/admin-route";
import { buildPaginationMeta, paginationSkip, parsePagination } from "@/lib/data/pagination";
import { db } from "@/lib/db";
import { promotionCreateSchema } from "@/lib/validations/admin";

export async function GET(request: Request) {
  return runAdminRoute(request, async (req, requestId) => {
    const { page, pageSize } = parsePagination(new URL(req.url).searchParams);
    const [total, promotions] = await Promise.all([
      db.promotion.count(),
      db.promotion.findMany({
        orderBy: { createdAt: "desc" },
        skip: paginationSkip(page, pageSize),
        take: pageSize,
      }),
    ]);
    return apiSuccess(
      { promotions, pagination: buildPaginationMeta(total, page, pageSize), requestId },
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

    const parsed = promotionCreateSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.flatten().fieldErrors, requestId);
    }

    const promotion = await db.promotion.create({
      data: {
        title: parsed.data.title,
        body: parsed.data.body,
        active: parsed.data.active ?? true,
        startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
        endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
        placement: parsed.data.placement ?? "HOME_BANNER",
      },
    });

    return created({ promotion, requestId }, requestId);
  });
}
