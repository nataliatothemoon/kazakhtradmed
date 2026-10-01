import { plants } from "@/lib/plants/catalog";
import type { Plant } from "@/lib/plants/types";

export const SYMPTOM_OPTIONS = [
  { id: "itching", label: "Itching" },
  { id: "scaling", label: "Scaling or silvery plaques" },
  { id: "weeping", label: "Weeping, oozing, or wet patches" },
  { id: "dryness", label: "Dryness or hair/scalp issues" },
  { id: "wounds", label: "Wounds, burns, or broken skin" },
  { id: "acne", label: "Acne-like bumps or pustules" },
  { id: "eczema", label: "Described as eczema or dermatitis" },
  { id: "psoriasis", label: "Described as psoriasis" },
] as const;

export type ConsultMatch = {
  plant: Plant;
  score: number;
  matchedTags: string[];
  matchedUses: Plant["traditionalUses"];
};

export function matchPlants(tags: string[], notes = ""): ConsultMatch[] {
  const note = notes.toLowerCase();
  const wanted = new Set(tags);

  return plants
    .map((plant) => {
      const matchedTags = plant.applicationTags.filter((tag) => wanted.has(tag));
      const matchedUses = plant.traditionalUses.filter((use) => {
        const blob = `${use.condition} ${use.preparation}`.toLowerCase();
        return (
          matchedTags.some((tag) => blob.includes(tag.replace("-", " "))) ||
          tags.some((tag) => blob.includes(tag)) ||
          (note && blob.includes(note.slice(0, 24)))
        );
      });

      const skinReviewBoost = plant.traditionalUses.some(
        (use) => use.sourceId === "berganayeva-2023",
      )
        ? 3
        : 0;
      const score =
        matchedTags.length * 4 +
        matchedUses.length * 2 +
        skinReviewBoost +
        (plant.applicationTags.includes("skin") ? 1 : 0);

      return { plant, score, matchedTags, matchedUses };
    })
    .filter((row) => row.matchedTags.length > 0 || row.matchedUses.length > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);
}
