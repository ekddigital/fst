import { apiSuccess } from "@/lib/api/response";
import { runAdminRoute } from "@/lib/api/admin-route";
import { buildPaginationMeta, paginationSkip, parsePagination } from "@/lib/data/pagination";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  return runAdminRoute(request, async (req, requestId) => {
    const { page, pageSize } = parsePagination(new URL(req.url).searchParams);
    const [total, requests] = await Promise.all([
      db.resourceRequest.count(),
      db.resourceRequest.findMany({
        orderBy: { createdAt: "desc" },
        skip: paginationSkip(page, pageSize),
        take: pageSize,
      }),
    ]);
    return apiSuccess(
      { requests, pagination: buildPaginationMeta(total, page, pageSize), requestId },
      200,
      requestId,
    );
  });
}
