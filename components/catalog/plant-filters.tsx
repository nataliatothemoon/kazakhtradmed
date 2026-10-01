"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Label } from "@/components/ui/input";

const EVIDENCE = [
  { value: "all", label: "Any evidence" },
  { value: "traditional", label: "Traditional use" },
  { value: "lab", label: "Lab assays" },
];

export type FilterState = {
  q: string;
  tag: string;
  family: string;
  evidence: string;
};

export function PlantFilters({
  tags,
  families,
  initial,
}: {
  tags: string[];
  families: string[];
  initial: FilterState;
}) {
  const router = useRouter();
  const [filters, setFilters] = useState(initial);

  function push(next: FilterState) {
    const url = new URLSearchParams();
    if (next.q.trim()) url.set("q", next.q.trim());
    if (next.tag && next.tag !== "all") url.set("tag", next.tag);
    if (next.family && next.family !== "all") url.set("family", next.family);
    if (next.evidence && next.evidence !== "all") url.set("evidence", next.evidence);
    const query = url.toString();
    router.push(query ? `/plants?${query}` : "/plants");
  }

  function changeSelect(key: "tag" | "family" | "evidence", value: string) {
    const next = { ...filters, [key]: value };
    setFilters(next);
    push(next);
  }

  return (
    <form
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      onSubmit={(event) => {
        event.preventDefault();
        push(filters);
      }}
    >
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="q">Search a condition</Label>
        <Input
          id="q"
          name="q"
          value={filters.q}
          onChange={(event) => setFilters({ ...filters, q: event.target.value })}
          placeholder="eczema, itch, wound, stomach…"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="tag">Condition tag</Label>
        <select
          id="tag"
          name="tag"
          className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
          value={filters.tag}
          onChange={(event) => changeSelect("tag", event.target.value)}
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
          value={filters.family}
          onChange={(event) => changeSelect("family", event.target.value)}
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
          value={filters.evidence}
          onChange={(event) => changeSelect("evidence", event.target.value)}
        >
          {EVIDENCE.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-end gap-2">
        <button
          type="submit"
          className="h-9 rounded-lg bg-primary px-3 text-sm text-primary-foreground"
        >
          Search
        </button>
      </div>
    </form>
  );
}
