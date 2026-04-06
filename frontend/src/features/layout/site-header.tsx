"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-context";
import { isStandaloneFrontend } from "@/lib/standalone";
import { cn } from "@/lib/utils";

function LogoLockup({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-3", className)}>
      <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-shelter-sm sm:h-12 sm:w-12">
        <svg
          viewBox="0 0 32 32"
          className="h-6 w-6 sm:h-7 sm:w-7"
          fill="currentColor"
          aria-hidden
        >
          <path d="M16 6c-1.2 0-2.3.4-3.2 1.1A4.5 4.5 0 0 0 8 8.5C6.5 8.5 5 9.8 5 12v.5c0 2 1.2 3.8 2.8 5.4.6.6 1 1.4 1.2 2.2l.8 3.2c.2.8.9 1.4 1.8 1.4h12.8c.9 0 1.6-.6 1.8-1.4l.8-3.2c.2-.8.6-1.6 1.2-2.2C27.8 16.3 29 14.5 29 12.5V12c0-2.2-1.5-3.5-3-3.5a4.5 4.5 0 0 0-4.8-1.4A5.2 5.2 0 0 0 16 6Zm-1 10.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm-5-1a1.5 1.5 0 1 1 0 .01v-.01Zm12 0a1.5 1.5 0 1 1 0 .01v-.01Z" />
        </svg>
      </span>
      <span className="font-display text-sm font-bold leading-none tracking-[0.06em] text-primary sm:text-[0.9375rem]">
        DOG SHELTER
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const { user, loading, logout } = useAuth();
  const standalone = isStandaloneFrontend();

  const rowText = "text-sm font-medium leading-none text-text-secondary";
  const rowAccent = "text-sm font-semibold leading-none text-primary";

  return (
    <header className="border-b border-border/60 bg-canvas/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-4 px-6 py-6 sm:px-8 lg:gap-x-8 lg:px-10">
        <LogoLockup className="shrink-0" />
        <div className="flex min-h-10 min-w-0 flex-1 flex-wrap items-center justify-end gap-x-6 sm:gap-x-8 lg:gap-x-10">
          {!standalone && user?.is_superuser ? (
            <Link
              href="/admin/dogs/new"
              className={cn(rowAccent, "shrink-0 transition-colors hover:text-brand-alt")}
            >
              Admin
            </Link>
          ) : null}
          <div className="flex min-h-10 shrink-0 flex-wrap items-center justify-end gap-x-4 gap-y-2 border-border/80 sm:border-l sm:pl-8 lg:pl-10">
            {standalone ? (
              <span className="text-xs font-semibold uppercase tracking-wide text-brand">
                Preview
              </span>
            ) : loading ? (
              <span className="text-xs text-text-muted">…</span>
            ) : user ? (
              <>
                <span
                  className={cn(
                    rowText,
                    "hidden max-w-[14rem] truncate md:inline",
                  )}
                >
                  {user.email}
                </span>
                <Button type="button" variant="outline" size="sm" className="h-9 shrink-0" onClick={() => logout()}>
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="h-9">
                  <Link href="/login">Log in</Link>
                </Button>
                <Button asChild size="sm" className="h-9 rounded-full">
                  <Link href="/register">Register</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
