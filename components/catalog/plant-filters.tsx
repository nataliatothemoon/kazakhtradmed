"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/input";

const EVIDENCE = [
  { value: "all", label: "Any evidence" },
  { value: "traditional", label: "Traditional use" },
  { value: "lab", label: "Lab assays" },
];

export function PlantFilters({
  tags,
  families,
}: {
  tags: string[];
  families: string[];
}) {
  const router = useRouter();
  const params = useSearchParams();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value && value !== "all") next.set(key, value);
    else next.delete(key);
    router.push(`/plants?${next.toString()}`);
  }

  return (
    <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" method="get">
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="q">Search</Label>
        <Input
          id="q"
          name="q"
          defaultValue={params.get("q") ?? ""}
          placeholder="Name, condition, family…"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="tag">Condition tag</Label>
        <select
          id="tag"
          name="tag"
          className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
          defaultValue={params.get("tag") ?? "all"}
          onChange={(event) => update("tag", event.target.value)}
        >
          <option value="all">All conditions</option>
          {tags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="family">Family</Label>
        <select
          id="family"
          name="family"
          className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
          defaultValue={params.get("family") ?? "all"}
          onChange={(event) => update("family", event.target.value)}
        >
          <option value="all">All families</option>
          {families.map((family) => (
            <option key={family} value={family}>
              {family}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="evidence">Evidence</Label>
        <select
          id="evidence"
          name="evidence"
          className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
          defaultValue={params.get("evidence") ?? "all"}
          onChange={(event) => update("evidence", event.target.value)}
        >
          {EVIDENCE.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-end">
        <button
          type="submit"
          className="h-9 rounded-lg bg-primary px-3 text-sm text-primary-foreground"
        >
          Apply search
        </button>
      </div>
    </form>
  );
}
