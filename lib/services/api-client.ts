/**
 * Centralized API Client for OrthoSense Django REST Backend.
 * Base URL defaults to http://localhost:8000/api/v1
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

let refreshRequest: Promise<unknown> | null = null;
let csrfToken: string | null = null;
let csrfRequest: Promise<string> | null = null;

export function setCsrfToken(token: string) { csrfToken = token; }

async function getCsrfToken(): Promise<string> {
  if (csrfToken) return csrfToken;
  if (!csrfRequest) {
    csrfRequest = request<{ csrfToken: string }>("/auth/csrf/")
      .then((data) => { csrfToken = data.csrfToken; return data.csrfToken; })
      .finally(() => { csrfRequest = null; });
  }
  return csrfRequest;
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  refreshed = false
): Promise<T> {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  if (new URL(url, API_BASE_URL).origin !== new URL(API_BASE_URL).origin) {
    throw new Error("Refusing to send API credentials to another origin.");
  }
  options.signal?.throwIfAborted();
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Accept", "application/json");

  if (!["GET", "HEAD", "OPTIONS"].includes(options.method || "GET")) {
    headers.set("X-CSRFToken", await getCsrfToken());
  }

  let response: Response;
  try {
    response = await fetch(url, { ...options, headers, credentials: "include", cache: "no-store" });
  } catch (error) {
    if (!options.signal?.aborted && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("orthosense:api-error", { detail: { message: "Backend connection unavailable. Retry when connected.", status: 0 } }));
    }
    throw error;
  }

  if (response.status === 401 && !refreshed && !["/auth/login/", "/auth/logout/", "/auth/refresh/", "/auth/csrf/"].includes(endpoint)) {
    try {
      if (!refreshRequest) refreshRequest = request("/auth/refresh/", { method: "POST" }, true).finally(() => { refreshRequest = null; });
      await refreshRequest;
      return request<T>(endpoint, options, true);
    } catch { /* Continue to the original unauthorized response. */ }
  }
  if (!response.ok) {
    const body = await response.text();
    let errorData: unknown = body;
    try {
      errorData = JSON.parse(body);
    } catch { /* Preserve non-JSON errors without reading the body twice. */ }
    const details = typeof errorData === "object" && errorData !== null
      ? errorData as Record<string, unknown> : null;
    const message = String(details?.detail || details?.error || (details ? JSON.stringify(details) : `Request failed with status ${response.status}`));
    if (response.status === 401 && !["/auth/login/", "/auth/me/"].includes(endpoint) && typeof window !== "undefined") {
      csrfToken = null;
      window.dispatchEvent(new Event("orthosense:session-expired"));
    }

    if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("orthosense:api-error", { detail: { message, status: response.status } }));
    throw new ApiError(message, response.status, errorData);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, data?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(endpoint: string, data?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T>(endpoint: string, data?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),
};
