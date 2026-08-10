const MAX_BODY_BYTES = 32_768;

export function validatePostRequest(request: Request): { ok: true } | { ok: false; message: string } {
  const contentLength = request.headers.get("content-length");
  if (contentLength && Number.parseInt(contentLength, 10) > MAX_BODY_BYTES) {
    return { ok: false, message: "Request body too large" };
  }

  const contentType = request.headers.get("content-type");
  if (contentType && !contentType.includes("application/json")) {
    return { ok: false, message: "Content-Type must be application/json" };
  }

  return { ok: true };
}
