declare global {
  interface Window {
    /** Set by root layout script from PUBLIC_API_URL / NEXT_PUBLIC_API_URL (runtime, not baked into client bundle). */
    __CANINE_PUBLIC_API_BASE__?: string;
  }
}

/**
 * Browser: URL injected by server-rendered script in root layout (pod env at request time).
 * Tests may call `setBrowserRuntimePublicApiBaseUrl` instead.
 */
let testOverride: string | null = null;

export function setBrowserRuntimePublicApiBaseUrl(url: string): void {
  testOverride = url.replace(/\/$/, "");
}

export function getBrowserRuntimePublicApiBaseUrl(): string | null {
  if (testOverride !== null) return testOverride;
  if (typeof window === "undefined") return null;
  const u = window.__CANINE_PUBLIC_API_BASE__;
  if (typeof u === "string" && u.length > 0) return u.replace(/\/$/, "");
  return null;
}
