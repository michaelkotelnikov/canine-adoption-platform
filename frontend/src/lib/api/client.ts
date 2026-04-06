import createClient from "openapi-fetch";

import type { paths } from "./schema";

/** Browser and client-side code — must be reachable from the user’s machine. */
export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
}

/**
 * Server Components / Route Handlers. In Docker Compose, set `API_URL` to the
 * backend service (e.g. http://backend:8000); `localhost` here would target the
 * frontend container, not the API.
 */
export function getServerApiBaseUrl(): string {
  return process.env.API_URL ?? getApiBaseUrl();
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
