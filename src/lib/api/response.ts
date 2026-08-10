import { NextResponse } from "next/server";

type ApiErrorBody = {
  code: string;
  message: string;
  details?: unknown;
};

function withRequestId(response: NextResponse, requestId?: string) {
  if (requestId) {
    response.headers.set("X-Request-Id", requestId);
  }
  return response;
}

export function apiSuccess<T>(data: T, status = 200, requestId?: string) {
  return withRequestId(NextResponse.json({ success: true, data }, { status }), requestId);
}

export function created<T>(data: T, requestId?: string) {
  return apiSuccess(data, 201, requestId);
}

export function apiError(status: number, error: ApiErrorBody, requestId?: string) {
  return withRequestId(NextResponse.json({ success: false, error }, { status }), requestId);
}

export function badRequest(message: string, details?: unknown, requestId?: string) {
  return apiError(400, { code: "VALIDATION_ERROR", message, details }, requestId);
}

export function unauthorized(message = "Authentication required.", requestId?: string) {
  return apiError(401, { code: "UNAUTHORIZED", message }, requestId);
}

export function notFound(message = "Resource not found.", requestId?: string) {
  return apiError(404, { code: "NOT_FOUND", message }, requestId);
}

export function conflict(message: string, details?: unknown, requestId?: string) {
  return apiError(409, { code: "CONFLICT", message, details }, requestId);
}

export function serverError(message = "Something went wrong. Please try again.", requestId?: string) {
  return apiError(500, { code: "INTERNAL_ERROR", message }, requestId);
}

export function serviceUnavailable(message = "This feature is not available yet.", requestId?: string) {
  return apiError(503, { code: "SERVICE_UNAVAILABLE", message }, requestId);
}

export function tooManyRequests(retryAfterSec: number, requestId?: string) {
  const response = apiError(
    429,
    { code: "RATE_LIMIT_EXCEEDED", message: "Too many requests. Please try again later." },
    requestId,
  );
  response.headers.set("Retry-After", String(retryAfterSec));
  return response;
}

export function resolveRequestId(incoming?: string | null): string {
  if (incoming && /^[a-zA-Z0-9_-]{8,128}$/.test(incoming)) return incoming;
  return crypto.randomUUID();
}
