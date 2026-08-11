"use client";

export type AdminApiSuccess<T> = { success: true; data: T; requestId?: string };
export type AdminApiFailure = {
  success: false;
  error: { message: string; code?: string; details?: unknown };
  requestId?: string;
};
export type AdminApiJson<T> = AdminApiSuccess<T> | AdminApiFailure;

function buildHeaders(init?: RequestInit): HeadersInit {
  const headers: Record<string, string> = {};
  if (init?.headers) {
    const existing = new Headers(init.headers);
    existing.forEach((value, key) => {
      headers[key] = value;
    });
  }
  if (init?.body && !(init.body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
  }
  return headers;
}

async function parseAdminResponse<T>(res: Response): Promise<AdminApiJson<T>> {
  const requestId = res.headers.get("x-request-id") ?? undefined;
  const contentType = res.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return {
      success: false,
      error: {
        code: "INVALID_RESPONSE",
        message: res.ok
          ? "Unexpected server response."
          : `Request failed (${res.status}). Please try again.`,
      },
      requestId,
    };
  }

  try {
    const json = (await res.json()) as AdminApiJson<T> & { data?: T & { requestId?: string } };
    if (json.success) {
      const dataRequestId =
        json.data && typeof json.data === "object" && "requestId" in json.data
          ? String((json.data as { requestId?: string }).requestId ?? "")
          : undefined;
      return { ...json, requestId: requestId ?? dataRequestId };
    }
    return { ...json, requestId };
  } catch {
    return {
      success: false,
      error: { code: "INVALID_JSON", message: "Could not read server response." },
      requestId,
    };
  }
}

export async function adminFetch<T>(path: string, init?: RequestInit): Promise<AdminApiJson<T>> {
  try {
    const res = await fetch(path, {
      ...init,
      credentials: "include",
      headers: buildHeaders(init),
    });
    return parseAdminResponse<T>(res);
  } catch {
    return {
      success: false,
      error: { code: "NETWORK_ERROR", message: "Could not connect. Check your network and try again." },
    };
  }
}

export async function adminUpload(
  file: File,
  kind?: "images" | "videos" | "other",
): Promise<AdminApiJson<{ url: string; kind: string }>> {
  const formData = new FormData();
  formData.append("file", file);
  if (kind) formData.append("kind", kind);

  try {
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    return parseAdminResponse<{ url: string; kind: string }>(res);
  } catch {
    return {
      success: false,
      error: { code: "NETWORK_ERROR", message: "Upload failed. Check your connection and try again." },
    };
  }
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function swapIds(ids: string[], id: string, direction: "up" | "down"): string[] | null {
  const index = ids.indexOf(id);
  if (index === -1) return null;
  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= ids.length) return null;
  const next = [...ids];
  [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
  return next;
}

export function getArticleImageFromMarkdown(body: string): string | undefined {
  const match = body.match(/!\[[^\]]*\]\((\/images\/[^)]+)\)/);
  return match?.[1];
}
