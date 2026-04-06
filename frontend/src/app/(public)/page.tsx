import Link from "next/link";

import { Button } from "@/components/ui/button";
import { DogCard } from "@/features/dogs/dog-card";
import { createServerApiClient } from "@/lib/api/client";
import { MOCK_DOGS } from "@/lib/mock-dogs";
import { isStandaloneFrontend } from "@/lib/standalone";

export const dynamic = "force-dynamic";

function HomeHero() {
  return (
    <section className="relative mb-16 overflow-hidden rounded-4xl bg-canvas-alt px-6 py-16 sm:px-10 sm:py-20 lg:py-24">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-8 top-8 h-32 w-48 rounded-full bg-decorative/90 blur-sm sm:h-40 sm:w-56" />
        <div className="absolute left-1/4 top-4 h-24 w-36 rotate-12 rounded-full bg-decorative/70" />
        <div className="absolute right-4 top-12 h-28 w-44 -rotate-6 rounded-full bg-decorative/80" />
        <div className="absolute bottom-8 right-1/4 h-36 w-36 rounded-full bg-decorative/60" />
        <div className="absolute -right-6 bottom-20 h-40 w-52 rounded-full bg-decorative/75" />
      </div>
      <div className="relative mx-auto max-w-2xl text-center">
        <h1 className="font-display text-4xl font-bold tracking-tight text-primary sm:text-5xl lg:text-[2.75rem]">
          Find your furry friend
        </h1>
        <p className="mt-4 text-lg font-medium text-text-secondary sm:text-xl">
          Begin your adoption journey today — browse profiles, read stories, and meet dogs
          looking for a home.
        </p>
        <div className="mt-10 flex justify-center">
          <Button asChild variant="shelter" className="gap-0 pr-1.5">
            <Link href="/#dogs" className="inline-flex items-center gap-3">
              <span>Meet the puppies</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/20 text-primary-foreground">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  aria-hidden
                >
                  <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function DogGridSection({
  children,
  subtitle,
}: {
  children: React.ReactNode;
  subtitle: string;
}) {
  return (
    <section id="dogs" className="scroll-mt-24">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-text-secondary">
        Adopt
      </p>
      <h2 className="mt-1 font-display text-3xl font-bold text-primary sm:text-4xl">
        Adoptable dogs
      </h2>
      <p className="mt-3 max-w-2xl text-base text-text-secondary">{subtitle}</p>
      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  );
}

export default async function HomePage() {
  if (isStandaloneFrontend()) {
    const data = MOCK_DOGS;
    return (
      <>
        <HomeHero />
        <DogGridSection subtitle="Browse profiles and open a dog for details (mock data in standalone mode).">
          {data.map((dog) => (
            <DogCard key={dog.id} dog={dog} />
          ))}
        </DogGridSection>
      </>
    );
  }

  const client = createServerApiClient();
  const { data, error } = await client.GET("/dogs");

  if (error || !data) {
    return (
      <>
        <HomeHero />
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-card">
          <p className="font-display text-lg font-semibold text-primary">Could not load dogs.</p>
          <p className="mt-2 text-sm text-destructive">Check that the API is reachable and try again.</p>
          <p className="mt-2 text-sm text-text-secondary">
            Expected base URL:{" "}
            <code className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-text-body">
              {process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}
            </code>
          </p>
        </div>
      </>
    );
  }

  if (data.length === 0) {
    return (
      <>
        <HomeHero />
        <div className="rounded-2xl border border-border/80 bg-card/80 p-6 shadow-card">
          <p className="font-display font-semibold text-primary">No dogs yet</p>
          <p className="mt-2 text-sm text-text-secondary">
            An admin can add profiles from the portal after seeding the database.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <HomeHero />
      <DogGridSection subtitle="Browse profiles and open a dog for details, an AI-written overview, and follow-up chat.">
        {data.map((dog) => (
          <DogCard key={dog.id} dog={dog} />
        ))}
      </DogGridSection>
    </>
  );
}
