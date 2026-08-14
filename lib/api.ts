const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

export class ApiRequestError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

// --- Token state -----------------------------------------------------------
// Plain module state so this file never imports the store — the store's auth middleware pushes
// tokens in here instead, avoiding a circular import (same pattern as the customer frontend).

let accessToken: string | null = null;
let refreshToken: string | null = null;
let onTokensRefreshed: ((tokens: { accessToken: string; refreshToken: string }) => void) | null = null;
let onRefreshFailed: (() => void) | null = null;
const AUTH_STORAGE_KEY = "ms_admin_auth";

function syncTokensFromStorage(): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return;
    const stored = JSON.parse(raw) as { accessToken?: string; refreshToken?: string };
    if (!accessToken && stored.accessToken) accessToken = stored.accessToken;
    if (!refreshToken && stored.refreshToken) refreshToken = stored.refreshToken;
  } catch {
    // A malformed persisted session is handled by StoreProvider/logout; requests simply proceed
    // without a token and receive the normal 401 response.
  }
}

export function setTokens(tokens: { accessToken: string | null; refreshToken: string | null }): void {
  accessToken = tokens.accessToken;
  refreshToken = tokens.refreshToken;
}

export function setTokenRefreshHandlers(handlers: {
  onRefreshed: (tokens: { accessToken: string; refreshToken: string }) => void;
  onFailed: () => void;
}): void {
  onTokensRefreshed = handlers.onRefreshed;
  onRefreshFailed = handlers.onFailed;
}

// The backend rotates refresh tokens on every use and treats presenting an already-rotated token
// as theft (revokes every session for that user). Several requests can 401 at once — e.g. the
// dashboard's Promise.all of several calls — so without this guard each would fire its own
// refresh with the same (about-to-be-stale) token: the first rotates it, the rest then present
// the now-rotated token and get flagged as reuse, wiping out the session that first call just
// issued. Collapsing concurrent callers onto one in-flight request is the fix.
let refreshInFlight: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  syncTokensFromStorage();
  if (!refreshToken) return false;
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      const body: ApiEnvelope<{ accessToken: string; refreshToken: string }> = await res.json();
      if (!res.ok || !body.success) return false;

      setTokens(body.data);
      onTokensRefreshed?.(body.data);
      return true;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

async function request<T>(path: string, options?: RequestInit, isRetry = false): Promise<T> {
  syncTokensFromStorage();
  // FormData bodies must NOT get an explicit Content-Type — the browser sets the multipart
  // boundary itself. JSON bodies (the default) do.
  const isFormData = options?.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options?.headers as Record<string, string> | undefined),
  };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401 && !isRetry && path !== "/auth/refresh-token") {
    const refreshed = await refreshAccessToken();
    if (refreshed) return request<T>(path, options, true);
    onRefreshFailed?.();
  }

  const body: ApiEnvelope<T> = await res.json();

  if (!res.ok || !body.success) {
    throw new ApiRequestError(res.status, body.message || "Something went wrong. Please try again.");
  }

  return body.data;
}

/** For endpoints that return raw HTML (not the {success,message,data} envelope) — e.g. the
 * receipt view, which needs the Authorization header a plain <a href> navigation can't send. */
async function requestHtml(path: string): Promise<string> {
  syncTokensFromStorage();
  const headers: Record<string, string> = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await fetch(`${API_BASE_URL}${path}`, { headers });
  if (!res.ok) throw new ApiRequestError(res.status, "Could not load this document.");
  return res.text();
}

async function requestBlob(path: string): Promise<Blob> {
  syncTokensFromStorage();
  const headers: Record<string, string> = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  let res = await fetch(`${API_BASE_URL}${path}`, { headers });
  if (res.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      const retryHeaders: Record<string, string> = {};
      if (accessToken) retryHeaders.Authorization = `Bearer ${accessToken}`;
      res = await fetch(`${API_BASE_URL}${path}`, { headers: retryHeaders });
    }
  }
  if (!res.ok) throw new ApiRequestError(res.status, "Could not download this document.");
  return res.blob();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, payload?: unknown) =>
    request<T>(path, { method: "POST", body: payload !== undefined ? JSON.stringify(payload) : undefined }),
  put: <T>(path: string, payload?: unknown) =>
    request<T>(path, { method: "PUT", body: payload !== undefined ? JSON.stringify(payload) : undefined }),
  patch: <T>(path: string, payload?: unknown) =>
    request<T>(path, { method: "PATCH", body: payload !== undefined ? JSON.stringify(payload) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  postForm: <T>(path: string, formData: FormData) => request<T>(path, { method: "POST", body: formData }),
  getHtml: requestHtml,
  getBlob: requestBlob,
};
