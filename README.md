# Dala dári — Kazakh traditional medicine catalog

An educational MVP: a **cited ethnobotany database** plus a **skin-symptom lookup** that only retrieves plants already in that catalog. It is not a medical device, not a diagnosis, and not a replacement for a dermatologist or a traditional practitioner (*tawip*, *shypager*).

The app encodes three unique papers (five PDFs were supplied; two are preprint duplicates of the 2023 skin review):

- Zhao et al., 2025 — 118 medicinal-food plants used by Kazakh people in Altay, Xinjiang (Table 2).
- Berganayeva et al., *Molecules* 2023 — Kazakhstan flora used for skin diseases.
- Nurlybekova et al., *Molecules* 2022 — *Artemisia* traditional notes and methanol-extract enzyme/antioxidant assays.

Traditional uses, phytochemistry, and lab assays are stored as separate fields. In-vitro numbers are never treated as doses.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:43123](http://localhost:43123).

```bash
npm run build
npm start
```

No environment variables are required for the catalog or the local matcher.

Optional: set `AI_GATEWAY_API_KEY` (or deploy on Vercel with OIDC) so `/consult` can write a short prose summary of **retrieved** rows. Without a key, the same plant cards still appear.

## What the skin consult will not do

Pulse, tongue/eye photos, lesion images, PASI scores, hemoscanning, CMS Osipov, genetic tests, hirudotherapy, or invented “steppe heat” constitutions. Those need a practitioner, hardware, or texts we do not have.

## Deploy on Vercel

Standard Next.js. Framework preset: Next.js. Optional env: `AI_GATEWAY_API_KEY`.

## Stack

Next.js, TypeScript, Tailwind, shadcn/ui. Catalog JSON in `content/plants.json`. Sources in `content/sources.json`.
