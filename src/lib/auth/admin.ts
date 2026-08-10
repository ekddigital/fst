import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const ADMIN_SESSION_COOKIE = "fst_admin_session";
const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7;

function getAdminSecret(): string | null {
  return process.env.ADMIN_PASSWORD?.trim() || process.env.ADMIN_API_KEY?.trim() || null;
}

export function isAdminConfigured(): boolean {
  return Boolean(getAdminSecret());
}

function signPayload(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createSessionToken(): string | null {
  const secret = getAdminSecret();
  if (!secret) return null;

  const exp = Date.now() + SESSION_MAX_AGE_SEC * 1000;
  const payload = Buffer.from(JSON.stringify({ exp })).toString("base64url");
  const sig = signPayload(payload, secret);
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const secret = getAdminSecret();
  if (!secret) return false;

  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;

  const expected = signPayload(payload, secret);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    if (!timingSafeEqual(a, b)) return false;
  } catch {
    return false;
  }

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { exp?: number };
    if (!data.exp || Date.now() > data.exp) return false;
    return true;
  } catch {
    return false;
  }
}

export function verifyAdminPassword(password: string): boolean {
  const configured = process.env.ADMIN_PASSWORD?.trim();
  if (!configured) return false;
  if (password.length !== configured.length) return false;
  try {
    return timingSafeEqual(Buffer.from(password), Buffer.from(configured));
  } catch {
    return false;
  }
}

export function verifyAdminApiKey(request: Request): boolean {
  const configured = process.env.ADMIN_API_KEY?.trim();
  if (!configured) return false;

  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const key = authHeader.slice(7).trim();
    if (key.length === configured.length) {
      try {
        if (timingSafeEqual(Buffer.from(key), Buffer.from(configured))) return true;
      } catch {
        /* fall through */
      }
    }
  }

  const headerKey = request.headers.get("x-admin-api-key")?.trim();
  if (headerKey && headerKey.length === configured.length) {
    try {
      if (timingSafeEqual(Buffer.from(headerKey), Buffer.from(configured))) return true;
    } catch {
      /* fall through */
    }
  }

  return false;
}

export function isAdminAuthenticated(request: Request): boolean {
  if (verifyAdminApiKey(request)) return true;

  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(new RegExp(`${ADMIN_SESSION_COOKIE}=([^;]+)`));
  const token = match?.[1] ? decodeURIComponent(match[1]) : null;
  return verifySessionToken(token);
}

export async function isAdminAuthenticatedFromCookies(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

export function setAdminSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
  });
}

export function clearAdminSessionCookie(response: NextResponse): void {
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export type AdminAuthResult =
  | { ok: true }
  | { ok: false; status: 401; message: string };

export function requireAdmin(request: Request): AdminAuthResult {
  if (!isAdminConfigured()) {
    return { ok: false, status: 401, message: "Admin access is not configured." };
  }
  if (!isAdminAuthenticated(request)) {
    return { ok: false, status: 401, message: "Authentication required." };
  }
  return { ok: true };
}
