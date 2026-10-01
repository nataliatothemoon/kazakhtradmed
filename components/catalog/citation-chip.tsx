import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getSource } from "@/lib/plants/catalog";
import type { SourceId } from "@/lib/plants/types";

export function CitationChip({
  sourceId,
  locator,
}: {
  sourceId: SourceId;
  locator: string;
}) {
  const source = getSource(sourceId);
  return (
    <Badge variant="outline" className="max-w-full font-normal">
      <Link href="/sources" className="truncate">
        {source?.shortTitle ?? sourceId}
        {locator ? ` · ${locator}` : ""}
      </Link>
    </Badge>
  );
}
