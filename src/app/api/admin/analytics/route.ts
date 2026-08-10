import { apiSuccess } from "@/lib/api/response";
import { runAdminRoute } from "@/lib/api/admin-route";
import { getAssessmentStats, getSubmissionTrends, getTopVideos } from "@/lib/admin/dashboard";
import { db } from "@/lib/db";
import { ResourceType } from "@prisma/client";

export async function GET(request: Request) {
  return runAdminRoute(request, async (_req, requestId) => {
    const [trends, topVideos, assessmentStats, totalViews, uniqueSessions] = await Promise.all([
      getSubmissionTrends(14),
      getTopVideos(8),
      getAssessmentStats(),
      db.resourceView.count(),
      db.resourceView.groupBy({ by: ["sessionId"], _count: { id: true } }),
    ]);

    const videoCount = await db.resource.count({ where: { type: ResourceType.VIDEO } });
    const watchAgg = await db.resourceView.aggregate({ _sum: { durationSeconds: true } });

    return apiSuccess(
      {
        trends,
        topVideos,
        assessmentStats,
        watchTime: {
          totalSeconds: watchAgg._sum.durationSeconds ?? 0,
          totalViews,
          uniqueSessions: uniqueSessions.length,
          videoCount,
        },
        requestId,
      },
      200,
      requestId,
    );
  });
}
