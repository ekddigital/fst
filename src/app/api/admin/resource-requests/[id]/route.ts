import { apiSuccess, badRequest, validationError, notFound } from "@/lib/api/response";
import { runAdminRoute } from "@/lib/api/admin-route";
import { db } from "@/lib/db";
import { resourceRequestStatusSchema } from "@/lib/validations/admin";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  return runAdminRoute(request, async (req, requestId) => {
    const { id } = await context.params;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return badRequest("Invalid JSON body", undefined, requestId);
    }

    const parsed = resourceRequestStatusSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.flatten().fieldErrors, requestId);
    }

    const existing = await db.resourceRequest.findUnique({ where: { id } });
    if (!existing) return notFound("Resource request not found", requestId);

    const requestRow = await db.resourceRequest.update({
      where: { id },
      data: { status: parsed.data.status },
    });

    return apiSuccess({ request: requestRow, requestId }, 200, requestId);
  });
}
