import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Plant } from "@/lib/plants/types";

export function PlantCard({ plant }: { plant: Plant }) {
  const lead =
    plant.traditionalUses[0]?.condition ??
    (plant.bioassays.length
      ? "Laboratory enzyme and antioxidant assays only."
      : "Cited catalog record.");
  const preparation = plant.traditionalUses[0]?.preparation;

  return (
    <Card className="h-full transition-colors hover:bg-muted/40">
      <CardHeader>
        <CardTitle className="font-heading italic">
          <Link href={`/plants/${plant.id}`} className="hover:underline">
            {plant.scientificName}
          </Link>
        </CardTitle>
        <CardDescription>
          {[plant.names.english, plant.names.chinese, plant.family]
            .filter(Boolean)
            .join(" · ")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Link href={`/plants/${plant.id}`} className="block space-y-3">
          <p className="line-clamp-3 text-sm text-muted-foreground">{lead}</p>
          {preparation ? (
            <p className="line-clamp-2 text-sm">
              <span className="font-medium">Preparation as published: </span>
              {preparation}
            </p>
          ) : null}
        </Link>
        <div className="flex flex-wrap gap-1">
          {plant.applicationTags.slice(0, 5).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              render={<Link href={`/plants?tag=${encodeURIComponent(tag)}`} />}
            >
              {tag}
            </Badge>
          ))}
          {plant.bioassays.length > 0 ? (
            <Badge variant="outline">lab assays</Badge>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
