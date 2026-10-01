import { ConsultForm } from "./consult-form";

export const metadata = { title: "Skin consult" };

export default function ConsultPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl">Skin symptom lookup</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Retrieve catalogued plants whose papers mention similar skin uses. The
          tool will not tell you whether a rash is eczema or psoriasis.
        </p>
      </div>
      <ConsultForm />
    </div>
  );
}
