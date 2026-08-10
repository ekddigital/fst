import { apiSuccess, resolveRequestId } from "@/lib/api/response";
import { checkDatabaseHealth } from "@/lib/api/form-handler";
import { isDatabaseConfigured } from "@/lib/db";

export async function GET(request: Request) {
  const requestId = resolveRequestId(request.headers.get("x-request-id"));
  const dbHealth = await checkDatabaseHealth();

  return apiSuccess(
    {
      status: "ok",
      database: {
        configured: isDatabaseConfigured(),
        connected: dbHealth.connected,
        latencyMs: dbHealth.latencyMs,
      },
    },
    200,
    requestId,
  );
}
