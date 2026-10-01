import { Suspense } from "react";
import { PlantCard } from "@/components/catalog/plant-card";
import { PlantFilters } from "@/components/catalog/plant-filters";
import type { FilterState } from "@/components/catalog/plant-filters";
import { allFamilies, allTags } from "@/lib/plants/catalog";
import { searchPlants } from "@/lib/plants/search";

type Search = Promise<{
  q?: string;
  tag?: string;
  family?: string;
  evidence?: string;
}>;

export const metadata = { title: "Plant catalog" };

export default async function PlantsPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const params = await searchParams;
  const evidence =
    params.evidence === "traditional" || params.evidence === "lab"
      ? params.evidence
      : "all";
  const results = searchPlants({
    q: params.q,
    tag: params.tag,
    family: params.family,
    evidence,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl">Plant catalog</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Search a condition first — eczema, itch, wound, stomach — or a Latin
          name, family, or local name. A condition match is listed before a
          name-only match. Traditional uses and lab assays stay separate on
          each monograph.
        </p>
      </div>
      <Suspense>
        <PlantFilters
          key={[params.q, params.tag, params.family, params.evidence].join("|")}
          tags={allTags()}
          families={allFamilies()}
          initial={initialFilters(params)}
        />
      </Suspense>
      <p className="text-sm text-muted-foreground">
        {results.length} record{results.length === 1 ? "" : "s"}
        {params.tag ? ` tagged “${params.tag}”` : ""}
        {params.q ? ` matching “${params.q}”` : ""}
      </p>
      {results.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
          Nothing matched that condition. Try eczema, itch, wound, or stomach,
          or clear a filter.
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((plant) => (
              <PlantCard key={plant.id} plant={plant} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function initialFilters(params: {
  q?: string;
  tag?: string;
  family?: string;
  evidence?: string;
}): FilterState {
  return {
    q: params.q ?? "",
    tag: params.tag ?? "all",
    family: params.family ?? "all",
    evidence: params.evidence ?? "all",
  };
}
