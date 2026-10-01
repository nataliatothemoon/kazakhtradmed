export const RED_FLAGS = [
  {
    id: "spreading",
    label: "Skin redness or swelling that is spreading quickly",
  },
  { id: "fever", label: "Fever, chills, or feeling systemically unwell" },
  { id: "pus", label: "Pus, rapidly worsening infection, or a hot painful area" },
  {
    id: "eyes",
    label: "Involvement of the eyes, mouth, genitals, or most of the body",
  },
  { id: "infant", label: "This concerns an infant or a child under 2 years" },
  { id: "pregnancy", label: "Pregnancy, or trying to treat a child who is pregnant" },
] as const;

export type RedFlagId = (typeof RED_FLAGS)[number]["id"];

export function hasRedFlags(ids: string[]) {
  return ids.some((id) => RED_FLAGS.some((flag) => flag.id === id));
}
