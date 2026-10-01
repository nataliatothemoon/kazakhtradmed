import plantsData from "@/content/plants.json";
import sourcesData from "@/content/sources.json";
import type { Plant, SourceRecord } from "./types";

export const plants = plantsData as Plant[];
export const sources = sourcesData as SourceRecord[];

const plantById = new Map(plants.map((plant) => [plant.id, plant]));
const sourceById = new Map(sources.map((source) => [source.id, source]));

export function getPlant(id: string) {
  return plantById.get(id);
}

export function getSource(id: string) {
  return sourceById.get(id as SourceRecord["id"]);
}

export function allTags() {
  return [...new Set(plants.flatMap((plant) => plant.applicationTags))].sort();
}

export function allFamilies() {
  return [...new Set(plants.map((plant) => plant.family).filter(Boolean))].sort();
}

export function featuredPlants() {
  const byUv = [...plants]
    .map((plant) => ({
      plant,
      uv: Math.max(
        0,
        ...plant.traditionalUses.map((use) => use.useValue ?? 0),
      ),
    }))
    .sort((a, b) => b.uv - a.uv);

  const skin = plants.filter((plant) =>
    plant.applicationTags.some((tag) =>
      ["eczema", "psoriasis", "skin", "acne", "wounds"].includes(tag),
    ),
  );

  const seen = new Set<string>();
  const picked: Plant[] = [];
  for (const { plant } of byUv.slice(0, 4)) {
    seen.add(plant.id);
    picked.push(plant);
  }
  for (const plant of skin) {
    if (picked.length >= 8) break;
    if (seen.has(plant.id)) continue;
    seen.add(plant.id);
    picked.push(plant);
  }
  return picked;
}

export function catalogStats() {
  return {
    plants: plants.length,
    traditionalUses: plants.reduce(
      (sum, plant) => sum + plant.traditionalUses.length,
      0,
    ),
    assays: plants.reduce((sum, plant) => sum + plant.bioassays.length, 0),
    sources: sources.filter((source) => source.canonical).length,
  };
}
