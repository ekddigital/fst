import { apiSuccess, badRequest, validationError, notFound } from "@/lib/api/response";
import { runAdminRoute } from "@/lib/api/admin-route";
import { db } from "@/lib/db";
import { promotionUpdateSchema } from "@/lib/validations/admin";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return runAdminRoute(request, async (req, requestId) => {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return badRequest("Invalid JSON body", undefined, requestId);
    }

    const parsed = promotionUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.flatten().fieldErrors, requestId);
    }

    const existing = await db.promotion.findUnique({ where: { id } });
    if (!existing) return notFound("Promotion not found", requestId);

    const promotion = await db.promotion.update({
      where: { id },
      data: {
        ...parsed.data,
        startDate:
          parsed.data.startDate !== undefined
            ? parsed.data.startDate
              ? new Date(parsed.data.startDate)
              : null
            : undefined,
        endDate:
          parsed.data.endDate !== undefined
            ? parsed.data.endDate
              ? new Date(parsed.data.endDate)
              : null
            : undefined,
      },
    });

    return apiSuccess({ promotion, requestId }, 200, requestId);
  });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return runAdminRoute(request, async (_req, requestId) => {
    const existing = await db.promotion.findUnique({ where: { id } });
    if (!existing) return notFound("Promotion not found", requestId);
    await db.promotion.delete({ where: { id } });
    return apiSuccess({ id, requestId }, 200, requestId);
  });
}
