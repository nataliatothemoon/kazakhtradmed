import { plants } from "./catalog";
import type { Plant } from "./types";

export type CatalogQuery = {
  q?: string;
  tag?: string;
  family?: string;
  evidence?: "traditional" | "lab" | "all";
};

/** Fold hyphens so "wound-healing" and "wound healing" compare as the same phrase. */
export function foldSearchText(value: string) {
  return value
    .toLowerCase()
    .replace(/[-–—_/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function conditionText(plant: Plant) {
  return foldSearchText(
    [
      ...plant.applicationTags,
      ...plant.traditionalUses.flatMap((use) => [
        use.condition,
        use.preparation,
        use.partUsed,
      ]),
    ].join(" "),
  );
}

function identityText(plant: Plant) {
  return foldSearchText(
    [
      plant.scientificName,
      plant.family,
      plant.names.english,
      plant.names.chinese,
      plant.names.kazakh,
      plant.habit,
      ...plant.regions,
    ].join(" "),
  );
}

function matchesQuery(blob: string, query: string) {
  if (!query) return false;
  if (blob.includes(query)) return true;
  const words = query.split(" ").filter((word) => word.length >= 3);
  return words.length > 1 && words.every((word) => blob.includes(word));
}

export function searchPlants(query: CatalogQuery): Plant[] {
  const q = foldSearchText(query.q ?? "");
  const filtered = plants.filter((plant) => {
    if (query.tag && !plant.applicationTags.includes(query.tag)) return false;
    if (query.family && plant.family !== query.family) return false;
    if (query.evidence === "traditional" && plant.traditionalUses.length === 0) {
      return false;
    }
    if (query.evidence === "lab" && plant.bioassays.length === 0) {
      return false;
    }
    return true;
  });

  if (!q) return filtered;

  return filtered
    .map((plant, index) => {
      const conditionHit = matchesQuery(conditionText(plant), q);
      const nameHit = matchesQuery(identityText(plant), q);
      if (!conditionHit && !nameHit) return null;
      return { plant, index, conditionHit };
    })
    .filter((row): row is { plant: Plant; index: number; conditionHit: boolean } =>
      Boolean(row),
    )
    .sort((a, b) => {
      if (a.conditionHit !== b.conditionHit) return a.conditionHit ? -1 : 1;
      return a.index - b.index;
    })
    .map((row) => row.plant);
}
