import Image from "next/image";
import Link from "next/link";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type DogCardDog = {
  id: number;
  name: string;
  breed: string;
  age: number;
  photo_url: string;
  status: string;
};

export function DogCard({ dog }: { dog: DogCardDog }) {
  return (
    <Link
      href={`/dogs/${dog.id}`}
      className="block transition-transform duration-200 hover:-translate-y-0.5"
    >
      <Card className="h-full overflow-hidden border-border/70 bg-card/95 shadow-card transition-shadow hover:shadow-shelter-sm">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-3xl bg-decorative/50">
          <Image
            src={dog.photo_url}
            alt={dog.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
            unoptimized
          />
        </div>
        <CardHeader className="space-y-1 pb-2">
          <h2 className="font-display text-xl font-bold text-primary">{dog.name}</h2>
          <p className="text-sm font-medium text-text-secondary">
            {dog.breed} · {dog.age} yrs
          </p>
        </CardHeader>
        <CardContent className="pb-2">
          <span
            className={cn(
              "inline-flex rounded-full px-3 py-0.5 text-xs font-semibold uppercase tracking-wide",
              dog.status === "available"
                ? "bg-primary/12 text-primary"
                : "bg-muted text-text-secondary",
            )}
          >
            {dog.status}
          </span>
        </CardContent>
        <CardFooter className="text-xs font-medium text-text-muted">View profile →</CardFooter>
      </Card>
    </Link>
  );
}
