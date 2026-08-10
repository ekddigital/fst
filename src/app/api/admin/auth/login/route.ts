import { apiSuccess, badRequest, resolveRequestId, serverError, unauthorized } from "@/lib/api/response";
import {
  createSessionToken,
  isAdminConfigured,
  setAdminSessionCookie,
  verifyAdminPassword,
} from "@/lib/auth/admin";
import { adminLoginSchema } from "@/lib/validations/admin";

export async function POST(request: Request) {
  const requestId = resolveRequestId(request.headers.get("x-request-id"));

  if (!isAdminConfigured()) {
    return serverError("Admin access is not configured.", requestId);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body", undefined, requestId);
  }

  const parsed = adminLoginSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Validation failed", parsed.error.flatten().fieldErrors, requestId);
  }

  if (!verifyAdminPassword(parsed.data.password)) {
    return unauthorized("Invalid password.", requestId);
  }

  const token = createSessionToken();
  if (!token) {
    return serverError("Could not create session.", requestId);
  }

  const response = apiSuccess({ authenticated: true, requestId }, 200, requestId);
  setAdminSessionCookie(response, token);
  return response;
}
