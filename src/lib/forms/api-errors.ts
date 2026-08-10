import type { FieldValues, UseFormReturn, Path } from "react-hook-form";

type ApiErrorJson = {
  error?: string | { message?: string; details?: { fields?: Record<string, string[]> } };
  errors?: Record<string, string[]>;
};

export function messageFromApiJson(data: ApiErrorJson): string {
  if (typeof data.error === "string") return data.error;
  if (data.error && typeof data.error === "object" && data.error.message) {
    return data.error.message;
  }
  return "Request failed. Please try again.";
}

export function setFormFieldErrors<T extends FieldValues>(form: UseFormReturn<T>, json: ApiErrorJson) {
  const fields =
    json.errors ??
    (json.error && typeof json.error === "object" ? json.error.details?.fields : undefined);

  if (!fields) return;

  for (const [field, messages] of Object.entries(fields)) {
    if (!messages?.[0]) continue;
    form.setError(field as Path<T>, { message: messages[0] });
  }
}
