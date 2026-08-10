import { apiSuccess } from "@/lib/api/response";
import { runAdminRoute } from "@/lib/api/admin-route";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  return runAdminRoute(request, async (_req, requestId) => {
    const requests = await db.resourceRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return apiSuccess({ requests, requestId }, 200, requestId);
  });
}
