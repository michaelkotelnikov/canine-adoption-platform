import type { components } from "@/lib/api/schema";

export type DogRead = components["schemas"]["DogRead"];

/** Static dataset for standalone / UI-only deployments (aligned with backend seed examples). */
export const MOCK_DOGS: DogRead[] = [
  {
    id: 1,
    name: "Maple",
    breed: "Golden Retriever mix",
    age: 3,
    sex: "female",
    size: "large",
    description: "Loves water, gentle with kids, knows sit and stay.",
    photo_url: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=800",
    status: "available",
    created_at: "2025-01-01T12:00:00Z",
    updated_at: "2025-01-01T12:00:00Z",
  },
  {
    id: 2,
    name: "Crumbs",
    breed: "Terrier mix",
    age: 5,
    sex: "male",
    size: "small",
    description: "Energetic and curious; best as the only dog in the home.",
    photo_url: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=800",
    status: "available",
    created_at: "2025-01-01T12:00:00Z",
    updated_at: "2025-01-01T12:00:00Z",
  },
  {
    id: 3,
    name: "Nova",
    breed: "Border Collie",
    age: 2,
    sex: "female",
    size: "medium",
    description: "Needs mental stimulation and daily exercise; very trainable.",
    photo_url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800",
    status: "available",
    created_at: "2025-01-01T12:00:00Z",
    updated_at: "2025-01-01T12:00:00Z",
  },
  {
    id: 4,
    name: "Bruno",
    breed: "Labrador",
    age: 7,
    sex: "male",
    size: "large",
    description: "Calm senior who enjoys short walks and long naps.",
    photo_url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800",
    status: "adopted",
    created_at: "2025-01-01T12:00:00Z",
    updated_at: "2025-01-01T12:00:00Z",
  },
];

export function getMockDogById(id: number): DogRead | undefined {
  return MOCK_DOGS.find((d) => d.id === id);
}
