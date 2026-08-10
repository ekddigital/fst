import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { resolveRequestId, serverError, unauthorized } from "@/lib/api/response";

type AdminHandler = (request: Request, requestId: string) => Promise<NextResponse>;

export async function runAdminRoute(request: Request, handler: AdminHandler): Promise<NextResponse> {
  const requestId = resolveRequestId(request.headers.get("x-request-id"));

  const auth = requireAdmin(request);
  if (!auth.ok) {
    return unauthorized(auth.message, requestId);
  }

  try {
    return await handler(request, requestId);
  } catch (err) {
    console.error(
      JSON.stringify({
        level: "error",
        message: "Admin route error",
        requestId,
        path: new URL(request.url).pathname,
        err,
      }),
    );
    return serverError(undefined, requestId);
  }
}
