import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { DogAiPanel } from "@/features/dogs/dog-ai-panel";
import { DogHeroImage } from "@/features/dogs/dog-hero-image";
import { createServerApiClient } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";
import { MOCK_DOGS } from "@/lib/mock-dogs";
import { isStandaloneFrontend } from "@/lib/standalone";
import { cn } from "@/lib/utils";

type DogRead = components["schemas"]["DogRead"];

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

function DataField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-text-secondary">
        {label}
      </p>
      <p className="mt-1.5 font-display text-base font-semibold capitalize leading-snug tracking-tight text-primary">
        {value}
      </p>
    </div>
  );
}

function neighborIds(
  dogId: number,
  ids: number[],
): { prev: number | null; next: number | null } {
  const sorted = [...ids].sort((a, b) => a - b);
  const idx = sorted.indexOf(dogId);
  if (idx < 0) return { prev: null, next: null };
  return {
    prev: idx > 0 ? sorted[idx - 1]! : null,
    next: idx < sorted.length - 1 ? sorted[idx + 1]! : null,
  };
}

function ChevronIcon({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      className="h-5 w-5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {dir === "left" ? (
        <path d="M15 18l-6-6 6-6" />
      ) : (
        <path d="M9 18l6-6-6-6" />
      )}
    </svg>
  );
}

export default async function DogDetailPage({ params }: Props) {
  const { id } = await params;
  const dogId = Number.parseInt(id, 10);
  if (Number.isNaN(dogId)) notFound();

  const standalone = isStandaloneFrontend();
  let dog: DogRead;
  let prevId: number | null = null;
  let nextId: number | null = null;

  if (standalone) {
    const found = MOCK_DOGS.find((d) => d.id === dogId);
    if (!found) notFound();
    dog = found as DogRead;
    const ids = MOCK_DOGS.map((d) => d.id);
    const n = neighborIds(dogId, ids);
    prevId = n.prev;
    nextId = n.next;
  } else {
    const client = createServerApiClient();
    const res = await client.GET("/dogs/{dog_id}", {
      params: { path: { dog_id: dogId } },
    });
    if (res.error || !res.data) notFound();
    dog = res.data;
    const listRes = await client.GET("/dogs");
    const ids = listRes.data?.map((d) => d.id) ?? [];
    const n = neighborIds(dogId, ids);
    prevId = n.prev;
    nextId = n.next;
  }

  const adoptMail = `mailto:hello@dogshelter.example?subject=${encodeURIComponent(`Adoption interest — ${dog.name}`)}`;

  const chevronBase =
    "absolute z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border/40 bg-card/90 text-primary shadow-card backdrop-blur-sm transition-all duration-200 hover:border-primary/25 hover:bg-card hover:text-primary hover:shadow-shelter-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

  const adoptCta =
    dog.age <= 1 ? "Adopt this puppy" : `Adopt ${dog.name}`;

  /** Square fills grid column (same width as metadata/overview rails); object-cover crops per photo. */
  const hero = (
    <div className="relative flex w-full flex-col">
      <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-3xl bg-decorative shadow-card ring-1 ring-border/30">
        <DogHeroImage
          src={dog.photo_url}
          alt={dog.name}
          className="object-cover"
          sizes="176px"
          priority
        />

        {prevId != null ? (
          <Link
            href={`/dogs/${prevId}`}
            className={cn(chevronBase, "left-3 top-[45%]")}
            aria-label="Previous dog"
          >
            <ChevronIcon dir="left" />
          </Link>
        ) : (
          <span
            className={cn(chevronBase, "left-3 top-[45%] pointer-events-none opacity-25")}
            aria-disabled="true"
            aria-label="No previous dog"
            tabIndex={-1}
          >
            <ChevronIcon dir="left" />
          </span>
        )}
        {nextId != null ? (
          <Link
            href={`/dogs/${nextId}`}
            className={cn(chevronBase, "right-3 top-[45%]")}
            aria-label="Next dog"
          >
            <ChevronIcon dir="right" />
          </Link>
        ) : (
          <span
            className={cn(chevronBase, "right-3 top-[45%] pointer-events-none opacity-25")}
            aria-disabled="true"
            aria-label="No next dog"
            tabIndex={-1}
          >
            <ChevronIcon dir="right" />
          </span>
        )}
      </div>

      <div className="relative z-20 -mt-12 px-1 sm:-mt-16 sm:px-2">
        <div className="rounded-2xl border border-border/50 bg-glass/85 p-5 shadow-card backdrop-blur-md dark:bg-card/90">
          <p className="text-sm leading-relaxed text-text-body">{dog.description}</p>
          <div className="mt-4">
            <Button asChild variant="shelter" className="w-full gap-0 pr-1.5 sm:w-auto">
              <a href={adoptMail} className="inline-flex items-center justify-center gap-3">
                <span>{adoptCta}</span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-foreground/20">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 text-primary-foreground"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    aria-hidden
                  >
                    <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </a>
            </Button>
            <p className="mt-3 text-xs leading-relaxed text-text-muted">
              Opens your email app with a pre-filled subject line.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const leftRail = (
    <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:gap-x-8 lg:grid-cols-1 lg:gap-x-0 lg:gap-y-0 lg:divide-y lg:divide-border/45 [&>*]:lg:py-3.5">
      <DataField label="Name" value={dog.name} />
      <DataField label="Breed" value={dog.breed} />
      <DataField label="Age" value={`${dog.age} years`} />
      <DataField label="Size" value={dog.size} />
      <DataField label="Sex" value={dog.sex} />
      <DataField label="Status" value={dog.status} />
    </div>
  );

  return (
    <div className="pb-8 lg:flex lg:flex-1 lg:flex-col lg:pb-0">
      <Link
        href="/"
        className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-text-secondary transition-colors hover:text-primary"
      >
        <svg
          className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
        All dogs
      </Link>

      <h1 className="mb-8 mt-6 font-display text-3xl font-bold tracking-tight text-primary sm:text-4xl lg:hidden">
        {dog.name}
      </h1>

      <div className="lg:mt-4 lg:flex-1">
        <DogAiPanel dogId={dog.id} dogName={dog.name} hero={hero} leftRail={leftRail} />
      </div>
    </div>
  );
}
