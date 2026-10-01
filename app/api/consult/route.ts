import { generateText } from "ai";
import { matchPlants } from "@/lib/consult/match";
import { getPlant } from "@/lib/plants/catalog";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    tags?: string[];
    notes?: string;
    plantIds?: string[];
  };
  const tags = body.tags ?? [];
  const matches =
    body.plantIds?.map((id) => getPlant(id)).filter(Boolean) ??
    matchPlants(tags, body.notes).map((row) => row.plant);

  const allowed = matches.map((plant) => plant?.scientificName).filter(Boolean);

  if (!process.env.AI_GATEWAY_API_KEY && !process.env.VERCEL_OIDC_TOKEN) {
    return Response.json({
      summary: "",
      mode: "local",
      plants: allowed,
    });
  }

  const catalogLines = matches
    .slice(0, 8)
    .map((plant) => {
      if (!plant) return "";
      const use = plant.traditionalUses[0];
      return `- ${plant.scientificName}: ${use?.condition ?? "lab assays only"} (${use?.sourceId ?? "nurlybekova-2022"})`;
    })
    .join("\n");

  try {
    const result = await generateText({
      model: "openai/gpt-4.1-mini",
      prompt: `You rewrite retrieved ethnobotany rows for a lay reader.
Rules: mention only these species: ${allowed.join(", ")}.
Do not diagnose eczema or psoriasis. Do not invent doses, ointments, or extra plants.
Label lab assays as in vitro if you mention them.
Keep under 160 words.
Retrieved rows:
${catalogLines}
User notes: ${body.notes ?? "(none)"}
Tags: ${tags.join(", ")}`,
    });
    return Response.json({ summary: result.text, mode: "llm", plants: allowed });
  } catch {
    return Response.json({
      summary: "",
      mode: "local",
      plants: allowed,
    });
  }
}
