import Link from "next/link";
import { PlantCard } from "@/components/catalog/plant-card";
import { DisclaimerBanner } from "@/components/site/disclaimer";
import { buttonVariants } from "@/components/ui/button";
import { catalogStats, featuredPlants } from "@/lib/plants/catalog";
import { cn } from "cn";

export default function HomePage() {
  const stats = catalogStats();
  const featured = featuredPlants();

  return (
    <div className="space-y-10">
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div className="space-y-5">
          <p className="text-sm font-medium tracking-[0.18em] text-primary uppercase">
            Ethnobotany, cited
          </p>
          <h1 className="font-heading text-4xl leading-tight text-balance sm:text-5xl">
            A steppe pharmacopoeia you can actually source.
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground text-pretty">
            Browse medicinal-food plants documented among Kazakh communities in
            Altay, skin-plant monographs from Kazakhstan’s flora, and Artemisia
            enzyme assays from Central Asia. Every claim stays attached to a paper.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/plants" className={cn(buttonVariants())}>
              Open the catalog
            </Link>
            <Link href="/consult" className={cn(buttonVariants({ variant: "outline" }))}>
              Skin symptom lookup
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            [stats.plants, "plant records"],
            [stats.traditionalUses, "traditional-use rows"],
            [stats.assays, "lab assay values"],
            [stats.sources, "canonical papers"],
          ].map(([value, label]) => (
            <div key={String(label)} className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
              <div className="font-heading text-3xl">{value}</div>
              <div className="text-sm text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <DisclaimerBanner />

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-heading text-2xl">Start with these records</h2>
          <Link href="/plants" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((plant) => (
            <PlantCard key={plant.id} plant={plant} />
          ))}
        </div>
      </section>
    </div>
  );
}
