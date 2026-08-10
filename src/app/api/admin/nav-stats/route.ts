import { apiSuccess } from "@/lib/api/response";
import { runAdminRoute } from "@/lib/api/admin-route";
import { getNavBadges } from "@/lib/admin/dashboard";

export async function GET(request: Request) {
  return runAdminRoute(request, async (_req, requestId) => {
    const badges = await getNavBadges();
    return apiSuccess({ badges, requestId }, 200, requestId);
  });
}
