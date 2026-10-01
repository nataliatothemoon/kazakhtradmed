import { notFound } from "next/navigation";
import { CitationChip } from "@/components/catalog/citation-chip";
import { DisclaimerBanner } from "@/components/site/disclaimer";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getPlant, plants } from "@/lib/plants/catalog";

export function generateStaticParams() {
  return plants.map((plant) => ({ slug: plant.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const plant = getPlant(slug);
  return { title: plant?.scientificName ?? "Plant" };
}

export default async function PlantPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const plant = getPlant(slug);
  if (!plant) notFound();

  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <p className="text-sm text-muted-foreground">{plant.family}</p>
        <h1 className="font-heading text-4xl italic text-balance">
          {plant.scientificName}
        </h1>
        <p className="text-lg">
          {[plant.names.english, plant.names.chinese].filter(Boolean).join(" · ")}
        </p>
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          {plant.habit ? <span>{plant.habit}</span> : null}
          {plant.harvestStatus ? <span>harvest: {plant.harvestStatus}</span> : null}
          {plant.voucher ? <span>voucher {plant.voucher}</span> : null}
        </div>
        <div className="flex flex-wrap gap-1">
          {plant.applicationTags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </header>

      <DisclaimerBanner compact />

      {plant.regions.length > 0 ? (
        <p className="text-sm text-muted-foreground">
          Regions noted: {plant.regions.join("; ")}
        </p>
      ) : null}

      <section className="space-y-4">
        <h2 className="font-heading text-2xl">Traditional uses</h2>
        {plant.traditionalUses.length === 0 ? (
          <p className="text-muted-foreground">
            No traditional-use row is encoded for this species in the current
            papers. Lab assays may still be listed below.
          </p>
        ) : (
          <div className="space-y-4">
            {plant.traditionalUses.map((use, index) => (
              <div
                key={`${use.sourceId}-${index}`}
                className="space-y-2 rounded-xl bg-card p-4 ring-1 ring-foreground/10"
              >
                <p>{use.condition}</p>
                {use.preparation ? (
                  <p className="text-sm">
                    <span className="font-medium">Preparation as published: </span>
                    {use.preparation}
                  </p>
                ) : null}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  {use.partUsed ? <span>Part: {use.partUsed}</span> : null}
                  {use.foodUse ? <span>Food: {use.foodUse}</span> : null}
                  {use.useValue != null ? <span>UV {use.useValue}</span> : null}
                  <span>{use.community}</span>
                </div>
                <CitationChip sourceId={use.sourceId} locator={use.locator} />
              </div>
            ))}
          </div>
        )}
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="font-heading text-2xl">Phytochemistry</h2>
        {plant.phytochemistry.length === 0 ? (
          <p className="text-muted-foreground">No compound rows encoded yet.</p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {plant.phytochemistry.map((item, index) => (
              <li
                key={`${item.compound}-${index}`}
                className="rounded-lg border border-border/80 px-3 py-2 text-sm"
              >
                <div className="font-medium">{item.compound}</div>
                <div className="text-muted-foreground">
                  {[item.class, item.amount, item.extract].filter(Boolean).join(" · ")}
                </div>
                <CitationChip sourceId={item.sourceId} locator={item.locator} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3 rounded-xl border border-dashed p-4">
        <h2 className="font-heading text-2xl">Laboratory assays</h2>
        <p className="text-sm text-muted-foreground">
          In vitro measurements from methanol or solvent extracts. These are not
          doses, ointments, or prescriptions.
        </p>
        {plant.bioassays.length === 0 ? (
          <p className="text-muted-foreground">No assay values in the encoded papers.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 pr-3">Target</th>
                  <th className="py-2 pr-3">Value</th>
                  <th className="py-2 pr-3">Condition</th>
                  <th className="py-2">Source</th>
                </tr>
              </thead>
              <tbody>
                {plant.bioassays.map((assay, index) => (
                  <tr key={`${assay.target}-${index}`} className="border-b border-border/60">
                    <td className="py-2 pr-3">{assay.target}</td>
                    <td className="py-2 pr-3">
                      {assay.value} {assay.unit} ({assay.metric})
                    </td>
                    <td className="py-2 pr-3">
                      {assay.concentration}; {assay.extract}
                    </td>
                    <td className="py-2">
                      <CitationChip sourceId={assay.sourceId} locator={assay.locator} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {plant.cautions.length > 0 ? (
        <section className="space-y-2">
          <h2 className="font-heading text-2xl">Cautions in the source</h2>
          {plant.cautions.map((caution, index) => (
            <div key={index} className="rounded-xl bg-destructive/10 p-4 text-sm">
              <p>{caution.text}</p>
              <CitationChip sourceId={caution.sourceId} locator={caution.locator} />
            </div>
          ))}
        </section>
      ) : null}
    </article>
  );
}
