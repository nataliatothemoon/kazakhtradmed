import { AlertTriangle } from "lucide-react";

export function DisclaimerBanner({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex gap-3 rounded-xl border border-amber-800/20 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-200/20 dark:bg-amber-950/40 dark:text-amber-50">
      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
      <p>
        {compact
          ? "Literature lookup only — not a diagnosis or a treatment plan."
          : "This tool retrieves plants from three published papers. It cannot examine a pulse, a tongue, or a lesion, and it does not name a disease. Talk to a dermatologist or a qualified healer before using any herb, especially with other medicines."}
      </p>
    </div>
  );
}
