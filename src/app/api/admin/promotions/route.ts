import { apiSuccess, badRequest, created } from "@/lib/api/response";
import { runAdminRoute } from "@/lib/api/admin-route";
import { db } from "@/lib/db";
import { promotionCreateSchema } from "@/lib/validations/admin";

export async function GET(request: Request) {
  return runAdminRoute(request, async (_req, requestId) => {
    const promotions = await db.promotion.findMany({ orderBy: { createdAt: "desc" } });
    return apiSuccess({ promotions, requestId }, 200, requestId);
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
      return badRequest("Validation failed", parsed.error.flatten().fieldErrors, requestId);
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
