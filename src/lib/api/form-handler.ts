import type { z } from "zod";
import { db, isDatabaseConfigured } from "@/lib/db";
import {
  apiSuccess,
  badRequest,
  resolveRequestId,
  serverError,
  serviceUnavailable,
  tooManyRequests,
} from "@/lib/api/response";
import { checkRateLimit, rateLimitKey } from "@/lib/api/rate-limit";
import { validatePostRequest } from "@/lib/api/request-guard";

type FormHandlerOptions<T extends z.ZodType> = {
  route: string;
  schema: T;
  persist: (data: z.infer<T>) => Promise<{ id: string }>;
  unavailableMessage: string;
  logLabel: string;
};

export async function handleFormPost<T extends z.ZodType>(
  request: Request,
  options: FormHandlerOptions<T>,
) {
  const requestId = resolveRequestId(request.headers.get("x-request-id"));

  const guard = validatePostRequest(request);
  if (!guard.ok) {
    return badRequest(guard.message, undefined, requestId);
  }

  const limit = checkRateLimit(rateLimitKey(request, options.route));
  if (!limit.allowed) {
    return tooManyRequests(limit.retryAfterSec ?? 60, requestId);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body", undefined, requestId);
  }

  const parsed = options.schema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Validation failed", parsed.error.flatten().fieldErrors, requestId);
  }

  if (!isDatabaseConfigured()) {
    console.warn(
      JSON.stringify({ level: "warn", message: "DATABASE_URL not configured", requestId, route: options.route }),
    );
    return serviceUnavailable(options.unavailableMessage, requestId);
  }

  try {
    const submission = await options.persist(parsed.data);
    return apiSuccess({ id: submission.id, requestId }, 201, requestId);
  } catch (err) {
    console.error(
      JSON.stringify({ level: "error", message: options.logLabel, requestId, route: options.route, err }),
    );
    return serverError(undefined, requestId);
  }
}

export async function checkDatabaseHealth(): Promise<{ connected: boolean; latencyMs?: number }> {
  if (!isDatabaseConfigured()) {
    return { connected: false };
  }

  const start = Date.now();
  try {
    await db.$queryRaw`SELECT 1`;
    return { connected: true, latencyMs: Date.now() - start };
  } catch {
    return { connected: false };
  }
}
