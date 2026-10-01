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

  return (
    <Link href={`/plants/${plant.id}`} className="block h-full">
      <Card className="h-full transition-colors hover:bg-muted/40">
        <CardHeader>
          <CardTitle className="font-heading italic">{plant.scientificName}</CardTitle>
          <CardDescription>
            {[plant.names.english, plant.names.chinese, plant.family]
              .filter(Boolean)
              .join(" · ")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="line-clamp-3 text-sm text-muted-foreground">{lead}</p>
          <div className="flex flex-wrap gap-1">
            {plant.applicationTags.slice(0, 5).map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
            {plant.bioassays.length > 0 ? (
              <Badge variant="outline">lab assays</Badge>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
