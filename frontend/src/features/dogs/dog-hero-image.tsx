"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

/** Same default as backend seed / mock dogs — warm shelter photography. */
export const FALLBACK_DOG_PHOTO_URL =
  "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800";

function isProbablyValidPhotoUrl(url: string): boolean {
  const t = url.trim();
  if (!t) return false;
  try {
    const u = new URL(t);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

export function normalizeDogPhotoUrl(url: string | undefined | null): string {
  if (!url || !isProbablyValidPhotoUrl(url)) return FALLBACK_DOG_PHOTO_URL;
  return url.trim();
}

type DogHeroImageProps = {
  src: string;
  alt: string;
  className?: string;
  sizes: string;
  priority?: boolean;
};

export function DogHeroImage({ src, alt, className, sizes, priority }: DogHeroImageProps) {
  const [imgSrc, setImgSrc] = useState(() => normalizeDogPhotoUrl(src));

  useEffect(() => {
    setImgSrc(normalizeDogPhotoUrl(src));
  }, [src]);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      className={className}
      sizes={sizes}
      priority={priority}
      unoptimized
      onError={() => setImgSrc(FALLBACK_DOG_PHOTO_URL)}
    />
  );
}
