import { DisclaimerBanner } from "@/components/site/disclaimer";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl">About this catalog</h1>
      <DisclaimerBanner />
      <div className="max-w-2xl space-y-4 text-pretty">
        <p>
          Dala dári (steppe medicine) is an MVP educational catalog. It does not
          practice Kazakh traditional diagnostics. Pulse reading, tongue and eye
          inspection, palpation, hemoscanning, and clinic lab panels stay with
          practitioners.
        </p>
        <p>
          What it can do is retrieve plants whose published traditional uses or
          assays match a search or a skin-symptom questionnaire. Recommendations
          are lookups, not inventions: the software is not allowed to add a
          species or a dose that is missing from the JSON catalog.
        </p>
        <p>
          Local names from the Altay table are stored as published (often Chinese
          transcriptions of Kazakh names). English common names appear only when
          a paper used them.
        </p>
        <p>
          Tell a clinician about other medicines before using any herb. This
          prototype does not run a herb–drug interaction engine.
        </p>
      </div>
    </div>
  );
}
