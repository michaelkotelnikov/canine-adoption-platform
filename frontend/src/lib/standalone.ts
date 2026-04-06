/**
 * When true, the UI uses bundled mock data and skips real API calls for browsing.
 * Set via NEXT_PUBLIC_STANDALONE=1 (Docker standalone compose or local dev:standalone).
 */
export function isStandaloneFrontend(): boolean {
  const v = process.env.NEXT_PUBLIC_STANDALONE;
  return v === "1" || v === "true";
}
