import createClient from "openapi-fetch";

import type { paths } from "./schema";
import { getBrowserRuntimePublicApiBaseUrl } from "./runtime-public-api";

/**
 * Browser and client-side code — must be reachable from the user’s machine.
 * Prefer runtime URL from root layout script (`PUBLIC_API_URL` / `NEXT_PUBLIC_API_URL` on the
 * server) so OpenShift/K8s can set the API URL without rebuilding the image.
 */
export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    const runtime = getBrowserRuntimePublicApiBaseUrl();
    if (runtime !== null) return runtime;
  }
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
}

/**
 * Server Components / Route Handlers. In Docker Compose, set `API_URL` to the
 * backend service (e.g. http://backend:8000); `localhost` here would target the
 * frontend container, not the API.
 *
 * On Kubernetes/OpenShift you can set `PUBLIC_API_URL` (public HTTPS API) or `API_URL`
 * (in-cluster http://service:8000) — both are read at runtime on the server.
 */
export function getServerApiBaseUrl(): string {
  return (
    process.env.API_URL?.trim() ||
    process.env.PUBLIC_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    "http://localhost:8000"
  ).replace(/\/$/, "");
}

/** Server Components and Route Handlers — no browser Authorization header. */
export function createServerApiClient() {
  return createClient<paths>({ baseUrl: getServerApiBaseUrl() });
}

/** Unauthenticated calls (e.g. register) — never sends a stored JWT. */
export function createAnonApiClient() {
  return createClient<paths>({ baseUrl: getApiBaseUrl() });
}

/**
 * Browser / Client Components — attaches JWT from localStorage when present.
 */
export function createBrowserApiClient() {
  const client = createClient<paths>({ baseUrl: getApiBaseUrl() });
  client.use({
    onRequest({ request }) {
      if (typeof window === "undefined") return request;
      const token = window.localStorage.getItem("canine_access_token");
      if (token) request.headers.set("Authorization", `Bearer ${token}`);
      return request;
    },
  });
  return client;
}

export async function loginWithPassword(email: string, password: string) {
  const client = createClient<paths>({ baseUrl: getApiBaseUrl() });
  const { data, error, response } = await client.POST("/auth/jwt/login", {
    body: { username: email, password, scope: "" },
    bodySerializer: (body) => {
      const b = body as { username: string; password: string };
      return new URLSearchParams({
        username: b.username,
        password: b.password,
      }).toString();
    },
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  if (error || !response.ok) {
    throw new Error("Login failed");
  }
  return data!;
}
