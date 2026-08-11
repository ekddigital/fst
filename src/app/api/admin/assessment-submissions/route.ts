import { apiSuccess } from "@/lib/api/response";
import { runAdminRoute } from "@/lib/api/admin-route";
import { buildPaginationMeta, paginationSkip, parsePagination } from "@/lib/data/pagination";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  return runAdminRoute(request, async (req, requestId) => {
    const { page, pageSize } = parsePagination(new URL(req.url).searchParams);
    const [total, submissions] = await Promise.all([
      db.assessmentSubmission.count(),
      db.assessmentSubmission.findMany({
        orderBy: { createdAt: "desc" },
        skip: paginationSkip(page, pageSize),
        take: pageSize,
        include: {
          assessment: { select: { title: true, slug: true } },
        },
      }),
    ]);
    return apiSuccess(
      { submissions, pagination: buildPaginationMeta(total, page, pageSize), requestId },
      200,
      requestId,
    );
  });
}
