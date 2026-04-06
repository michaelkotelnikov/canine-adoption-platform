"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-context";
import { isStandaloneFrontend } from "@/lib/standalone";

export function AdminGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const standalone = isStandaloneFrontend();

  useEffect(() => {
    if (standalone) return;
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!user.is_superuser) {
      router.replace("/");
    }
  }, [standalone, user, loading, router]);

  if (standalone) {
    return (
      <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-card">
        <p className="font-display font-semibold text-primary">Admin portal unavailable</p>
        <p className="mt-2 text-sm text-text-secondary">
          The admin UI requires the FastAPI backend. Use{" "}
          <code className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-text-body">make up</code>{" "}
          for the full stack, or browse dogs in standalone preview mode.
        </p>
        <Button asChild className="mt-4" variant="shelterSecondary">
          <Link href="/">Back to dogs</Link>
        </Button>
      </div>
    );
  }

  if (loading || !user) {
    return <p className="text-sm text-text-muted">Checking access…</p>;
  }
  if (!user.is_superuser) {
    return null;
  }
  return <>{children}</>;
}
