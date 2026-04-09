import { NextResponse } from "next/server";

/**
 * Public API base URL for browsers — read from env at request time (OpenShift/K8s),
 * not from the Next.js client bundle.
 *
 * Priority: PUBLIC_API_URL (runtime) → NEXT_PUBLIC_API_URL (compat / local .env) → dev default.
 */
export function GET() {
  const apiBaseUrl =
    process.env.PUBLIC_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    "http://localhost:8000";
  return NextResponse.json({
    apiBaseUrl: apiBaseUrl.replace(/\/$/, ""),
  });
}
