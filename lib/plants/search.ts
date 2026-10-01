import { plants } from "./catalog";
import type { Plant } from "./types";

export type CatalogQuery = {
  q?: string;
  tag?: string;
  family?: string;
  evidence?: "traditional" | "lab" | "all";
};

function haystack(plant: Plant) {
  return [
    plant.scientificName,
    plant.family,
    plant.names.english,
    plant.names.chinese,
    plant.names.kazakh,
    plant.habit,
    ...plant.regions,
    ...plant.applicationTags,
    ...plant.traditionalUses.flatMap((use) => [
      use.condition,
      use.preparation,
      use.partUsed,
      use.foodUse,
    ]),
  ]
    .join(" ")
    .toLowerCase();
}

export function searchPlants(query: CatalogQuery): Plant[] {
  const q = query.q?.trim().toLowerCase() ?? "";
  return plants.filter((plant) => {
    if (query.tag && !plant.applicationTags.includes(query.tag)) return false;
    if (query.family && plant.family !== query.family) return false;
    if (query.evidence === "traditional" && plant.traditionalUses.length === 0) {
      return false;
    }
    if (query.evidence === "lab" && plant.bioassays.length === 0) {
      return false;
    }
    if (q && !haystack(plant).includes(q)) return false;
    return true;
  });
}
