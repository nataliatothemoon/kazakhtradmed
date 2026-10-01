import { Badge } from "@/components/ui/badge";
import { sources } from "@/lib/plants/catalog";

export const metadata = { title: "Sources" };

export default function SourcesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl">Sources</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Catalog records are encoded from three unique papers. Two additional
          PDFs in the research set are preprint copies of the 2023 skin review
          and are not encoded twice.
        </p>
      </div>
      <div className="space-y-4">
        {sources.map((source) => (
          <article
            key={source.id}
            className="space-y-2 rounded-xl bg-card p-5 ring-1 ring-foreground/10"
          >
            <div className="flex flex-wrap gap-2">
              {source.canonical ? (
                <Badge>canonical</Badge>
              ) : (
                <Badge variant="secondary">duplicate preprint</Badge>
              )}
              <Badge variant="outline">{source.license}</Badge>
            </div>
            <h2 className="font-heading text-xl text-balance">{source.title}</h2>
            <p className="text-sm text-muted-foreground">
              {source.authors} · {source.journal} {source.year}
            </p>
            <p>{source.role}</p>
            <p className="text-sm">
              DOI{" "}
              <a className="text-primary underline" href={source.url}>
                {source.doi}
              </a>
            </p>
            {source.duplicateOf ? (
              <p className="text-sm text-muted-foreground">
                Alias of {source.duplicateOf}. Use the published Molecules 2023
                version for citations.
              </p>
            ) : null}
          </article>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        CC BY PDFs for the two Molecules papers are stored under{" "}
        <code>content/sources/</code>. The Altay ethnobotany paper is CC BY-NC-ND;
        this app encodes Table 2 facts with a DOI citation and does not republish
        the article.
      </p>
    </div>
  );
}
