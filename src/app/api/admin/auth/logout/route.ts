import { apiSuccess, resolveRequestId } from "@/lib/api/response";
import { clearAdminSessionCookie } from "@/lib/auth/admin";
import { runAdminRoute } from "@/lib/api/admin-route";

export async function POST(request: Request) {
  return runAdminRoute(request, async (_req, requestId) => {
    const response = apiSuccess({ loggedOut: true, requestId }, 200, requestId);
    clearAdminSessionCookie(response);
    return response;
  });
}

export async function GET(request: Request) {
  const requestId = resolveRequestId(request.headers.get("x-request-id"));
  const response = apiSuccess({ loggedOut: true, requestId }, 200, requestId);
  clearAdminSessionCookie(response);
  return response;
}
