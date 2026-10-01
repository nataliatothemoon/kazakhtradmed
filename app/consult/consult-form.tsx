"use client";

import { useState } from "react";
import Link from "next/link";
import { CitationChip } from "@/components/catalog/citation-chip";
import { DisclaimerBanner } from "@/components/site/disclaimer";
import { Button } from "@/components/ui/button";
import { Label, Textarea } from "@/components/ui/input";
import { matchPlants, SYMPTOM_OPTIONS } from "@/lib/consult/match";
import { hasRedFlags, RED_FLAGS } from "@/lib/consult/safety";
import type { ConsultMatch } from "@/lib/consult/match";

export function ConsultForm() {
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [flags, setFlags] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [underCare, setUnderCare] = useState(false);
  const [matches, setMatches] = useState<ConsultMatch[] | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [summary, setSummary] = useState("");
  const [busy, setBusy] = useState(false);

  function toggle(list: string[], value: string, setter: (next: string[]) => void) {
    setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSummary("");
    if (hasRedFlags(flags)) {
      setBlocked(true);
      setMatches([]);
      return;
    }
    setBlocked(false);
    const next = matchPlants(symptoms, notes);
    setMatches(next);
    setBusy(true);
    try {
      const response = await fetch("/api/consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tags: symptoms,
          notes,
          plantIds: next.map((row) => row.plant.id),
        }),
      });
      if (!response.ok) return;
      const data = (await response.json()) as { summary?: string };
      if (data.summary) setSummary(data.summary);
    } catch {
      // Local cards already shown.
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <form onSubmit={onSubmit} className="space-y-6">
        <DisclaimerBanner />
        <fieldset className="space-y-3">
          <legend className="font-heading text-xl">Skin symptoms</legend>
          <p className="text-sm text-muted-foreground">
            This is not a differential diagnosis of eczema versus psoriasis. Tick
            what you want to look up in the catalog.
          </p>
          {SYMPTOM_OPTIONS.map((option) => (
            <label key={option.id} className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={symptoms.includes(option.id)}
                onChange={() => toggle(symptoms, option.id, setSymptoms)}
              />
              {option.label}
            </label>
          ))}
        </fieldset>
        <fieldset className="space-y-3">
          <legend className="font-heading text-xl">Red flags</legend>
          {RED_FLAGS.map((flag) => (
            <label key={flag.id} className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={flags.includes(flag.id)}
                onChange={() => toggle(flags, flag.id, setFlags)}
              />
              {flag.label}
            </label>
          ))}
        </fieldset>
        <div className="space-y-2">
          <Label htmlFor="notes">Optional notes</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Anything already tried, duration, location on the body…"
          />
        </div>
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            className="mt-1"
            checked={underCare}
            onChange={(event) => setUnderCare(event.target.checked)}
          />
          I am already seeing a doctor or traditional practitioner about this.
        </label>
        <Button type="submit" disabled={symptoms.length === 0 && flags.length === 0}>
          Match catalogued plants
        </Button>
      </form>

      <div className="space-y-4">
        {blocked ? (
          <div className="rounded-xl bg-destructive/10 p-5">
            <h2 className="font-heading text-2xl">Seek urgent care</h2>
            <p className="mt-2">
              Those warning signs are outside this catalog. Do not use herbal
              matching. Contact emergency services or a clinician now.
            </p>
          </div>
        ) : null}

        {matches && !blocked && matches.length === 0 ? (
          <div className="rounded-xl border border-dashed p-6 text-muted-foreground">
            No encoded traditional uses matched those tags. Try a broader skin tag
            or browse the catalog.
          </div>
        ) : null}

        {summary ? (
          <div className="rounded-xl bg-card p-4 text-sm ring-1 ring-foreground/10">
            <p className="mb-1 font-medium">Readable summary of retrieved rows</p>
            <p className="whitespace-pre-wrap">{summary}</p>
            {busy ? <p className="mt-2 text-muted-foreground">Writing…</p> : null}
          </div>
        ) : busy ? (
          <p className="text-sm text-muted-foreground">Optional summary loading…</p>
        ) : null}

        {matches?.map((row) => (
          <article
            key={row.plant.id}
            className="space-y-2 rounded-xl bg-card p-4 ring-1 ring-foreground/10"
          >
            <h3 className="font-heading text-xl italic">
              <Link href={`/plants/${row.plant.id}`} className="hover:underline">
                {row.plant.scientificName}
              </Link>
            </h3>
            <p className="text-sm text-muted-foreground">
              {[row.plant.names.english, row.plant.names.chinese, row.plant.family]
                .filter(Boolean)
                .join(" · ")}
            </p>
            {(row.matchedUses[0] ?? row.plant.traditionalUses[0]) ? (
              <p>{(row.matchedUses[0] ?? row.plant.traditionalUses[0]).condition}</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Matched on laboratory tags only. Open the monograph for in-vitro
                numbers — they are not a topical recipe.
              </p>
            )}
            {row.matchedUses[0]?.preparation ? (
              <p className="text-sm">
                <span className="font-medium">Preparation as published: </span>
                {row.matchedUses[0].preparation}
              </p>
            ) : null}
            {row.matchedUses[0]?.partUsed ? (
              <p className="text-sm text-muted-foreground">
                Part: {row.matchedUses[0].partUsed}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {(row.matchedUses[0] ?? row.plant.traditionalUses[0]) ? (
                <CitationChip
                  sourceId={(row.matchedUses[0] ?? row.plant.traditionalUses[0]).sourceId}
                  locator={(row.matchedUses[0] ?? row.plant.traditionalUses[0]).locator}
                />
              ) : null}
              {row.plant.bioassays.length > 0 ? (
                <span className="text-xs text-muted-foreground">
                  {row.plant.bioassays.length} in-vitro assay values on file
                </span>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
