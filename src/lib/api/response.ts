import { NextResponse } from "next/server";

type ApiErrorBody = {
  code: string;
  message: string;
  details?: unknown;
};

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(status: number, error: ApiErrorBody) {
  return NextResponse.json({ success: false, error }, { status });
}

export function badRequest(message: string, details?: unknown) {
  return apiError(400, { code: "VALIDATION_ERROR", message, details });
}

export function serverError(message = "Something went wrong. Please try again.") {
  return apiError(500, { code: "INTERNAL_ERROR", message });
}

export function serviceUnavailable(message = "This feature is not available yet.") {
  return apiError(503, { code: "SERVICE_UNAVAILABLE", message });
}

export function resolveRequestId(incoming?: string | null): string {
  if (incoming && /^[a-zA-Z0-9_-]{8,128}$/.test(incoming)) return incoming;
  return crypto.randomUUID();
}
