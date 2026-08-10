import type { FieldValues, UseFormReturn, Path } from "react-hook-form";

type ApiErrorJson = {
  error?: string | { message?: string; details?: Record<string, string[]> };
  errors?: Record<string, string[]>;
};

function extractFieldErrors(json: ApiErrorJson): Record<string, string[]> | undefined {
  if (json.errors) return json.errors;
  if (!json.error || typeof json.error !== "object") return undefined;
  return json.error.details;
}

export function messageFromApiJson(data: ApiErrorJson): string {
  if (typeof data.error === "string") return data.error;
  if (data.error && typeof data.error === "object" && data.error.message) {
    return data.error.message;
  }
  return "Request failed. Please try again.";
}

export function setFormFieldErrors<T extends FieldValues>(form: UseFormReturn<T>, json: ApiErrorJson) {
  const fields = extractFieldErrors(json);
  if (!fields) return;

  for (const [field, messages] of Object.entries(fields)) {
    if (!messages?.[0]) continue;
    form.setError(field as Path<T>, { message: messages[0] });
  }
}
