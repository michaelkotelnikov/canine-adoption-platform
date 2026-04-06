import { isStandaloneFrontend } from "@/lib/standalone";

export function StandaloneBanner() {
  if (!isStandaloneFrontend()) return null;

  return (
    <div className="border-b border-primary/20 bg-primary/10 px-4 py-2 text-center text-sm text-text-body">
      <strong className="font-semibold text-primary">Standalone preview</strong>
      {" — "}
      Mock dog data only. Authentication, admin, and AI require the full stack (
      <code className="rounded-md bg-canvas-alt px-1.5 py-0.5 text-xs">make up</code>).
    </div>
  );
}
