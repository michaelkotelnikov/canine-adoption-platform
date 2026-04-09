/**
 * Injects `window.__CANINE_PUBLIC_API_BASE__` from server env before client bundles run,
 * so browser API calls use the cluster/runtime URL without embedding it at `next build` time.
 */
export function PublicApiRuntimeScript() {
  const standalone =
    process.env.NEXT_PUBLIC_STANDALONE === "1" || process.env.NEXT_PUBLIC_STANDALONE === "true";
  const base = standalone
    ? "http://localhost:8000"
    : (
        process.env.PUBLIC_API_URL?.trim() ||
        process.env.NEXT_PUBLIC_API_URL?.trim() ||
        "http://localhost:8000"
      ).replace(/\/$/, "");

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `window.__CANINE_PUBLIC_API_BASE__=${JSON.stringify(base)};`,
      }}
    />
  );
}
