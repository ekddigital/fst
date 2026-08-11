import { toast } from "sonner";

type AdminApiFailure = {
  success: false;
  error: { message: string; code?: string; details?: unknown };
  requestId?: string;
};

export function extractFieldErrors(details: unknown): Record<string, string[]> | undefined {
  if (!details || typeof details !== "object") return undefined;
  const record = details as Record<string, unknown>;
  const fields: Record<string, string[]> = {};

  for (const [key, value] of Object.entries(record)) {
    if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
      fields[key] = value;
    }
  }

  return Object.keys(fields).length > 0 ? fields : undefined;
}

export function formatAdminErrorMessage(error: AdminApiFailure["error"], requestId?: string): string {
  const parts = [error.message];
  const fields = extractFieldErrors(error.details);

  if (fields) {
    const summary = Object.entries(fields)
      .map(([field, messages]) => `${field}: ${messages[0]}`)
      .join(" · ");
    if (summary) parts.push(summary);
  }

  if (requestId) {
    parts.push(`Ref: ${requestId.slice(0, 8)}`);
  }

  return parts.join(" — ");
}

/** Toast admin API failure; returns field errors for inline form display. */
export function adminNotifyError(res: AdminApiFailure): Record<string, string[]> | undefined {
  const fieldErrors = extractFieldErrors(res.error.details);
  toast.error(formatAdminErrorMessage(res.error, res.requestId));
  return fieldErrors;
}
