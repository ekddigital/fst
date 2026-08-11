import { apiSuccess, badRequest, validationError, notFound } from "@/lib/api/response";
import { runAdminRoute } from "@/lib/api/admin-route";
import { db } from "@/lib/db";
import { billUpdateSchema } from "@/lib/validations/admin";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return runAdminRoute(request, async (req, requestId) => {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return badRequest("Invalid JSON body", undefined, requestId);
    }

    const parsed = billUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.flatten().fieldErrors, requestId);
    }

    const existing = await db.bill.findUnique({ where: { id } });
    if (!existing) return notFound("Bill not found", requestId);

    const bill = await db.bill.update({
      where: { id },
      data: {
        ...parsed.data,
        dueDate:
          parsed.data.dueDate !== undefined
            ? parsed.data.dueDate
              ? new Date(parsed.data.dueDate)
              : null
            : undefined,
      },
    });

    return apiSuccess({ bill, requestId }, 200, requestId);
  });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return runAdminRoute(request, async (_req, requestId) => {
    const existing = await db.bill.findUnique({ where: { id } });
    if (!existing) return notFound("Bill not found", requestId);
    await db.bill.delete({ where: { id } });
    return apiSuccess({ id, requestId }, 200, requestId);
  });
}
