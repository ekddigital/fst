import { apiSuccess, badRequest, resolveRequestId, serverError, tooManyRequests, unauthorized, validationError } from "@/lib/api/response";
import { checkRateLimit, rateLimitKey } from "@/lib/api/rate-limit";
import {
  createSessionToken,
  isAdminConfigured,
  setAdminSessionCookie,
  verifyAdminPassword,
} from "@/lib/auth/admin";
import { adminLoginSchema } from "@/lib/validations/admin";

export async function POST(request: Request) {
  const requestId = resolveRequestId(request.headers.get("x-request-id"));

  const limit = checkRateLimit(rateLimitKey(request, "admin-login"));
  if (!limit.allowed) {
    return tooManyRequests(limit.retryAfterSec ?? 60, requestId);
  }

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
    return validationError(parsed.error.flatten().fieldErrors, requestId);
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
