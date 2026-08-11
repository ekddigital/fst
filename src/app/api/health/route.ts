import { apiSuccess, resolveRequestId, serviceUnavailable } from "@/lib/api/response";
import { checkDatabaseHealth } from "@/lib/api/form-handler";
import { isDatabaseConfigured } from "@/lib/db";

export async function GET(request: Request) {
  const requestId = resolveRequestId(request.headers.get("x-request-id"));
  const dbHealth = await checkDatabaseHealth();
  const dbConfigured = isDatabaseConfigured();
  const healthy = !dbConfigured || dbHealth.connected;

  return apiSuccess(
    {
      status: healthy ? "ok" : "degraded",
      database: {
        configured: dbConfigured,
        connected: dbHealth.connected,
        latencyMs: dbHealth.latencyMs,
      },
    },
    healthy ? 200 : 503,
    requestId,
  );
}
