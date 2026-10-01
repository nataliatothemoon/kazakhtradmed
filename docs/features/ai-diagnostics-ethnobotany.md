# Feature Requirement Document: Cited ethnobotany catalog and skin consult

## Feature Name

Kazakh traditional medicine catalog and educational skin consult

## Goal

Preserve and make searchable plant knowledge from three peer-reviewed sources, then let people explore literature-matched plants for chronic skin symptoms. This is an educational decision-support surface, not a clinic diagnostician and not a medical device.

## User Story

As a researcher, student, or curious reader, I want to browse Kazakh-related medicinal plants with paper citations, and optionally describe skin symptoms to see which catalogued plants the literature associates with similar uses, so that I can learn from documented tradition and lab work without invented remedies.

## Functional Requirements

1. Load a JSON catalog merged by scientific name from Zhao et al. 2025 (Altay Table 2), Berganayeva et al. 2023 (skin monographs), and Nurlybekova et al. 2022 (Artemisia assays).
2. Every traditional use, compound row, and assay carries `sourceId` and a locator (table or section).
3. Separate traditional ethnopharmacology from laboratory assays in the UI.
4. Search plants by scientific name, local name, family, and condition tags.
5. Filter by evidence type (traditional, phytochemistry, bioassay) and by condition tags including skin-related tags.
6. Plant pages show names, uses, preparations as written in the source, compounds, assays, and cautions.
7. Sources page lists the three canonical papers, licenses, and preprint duplicates.
8. Persistent educational disclaimer on all pages.
9. Consult form collects skin symptoms by checkbox and optional notes; no photos.
10. Red-flag answers stop herbal matching and show urgent-care copy.
11. Consult results are ranked catalog matches only; optional LLM rewrite may mention retrieved plants only.
12. Lab assays on consult results are labeled in vitro and are not doses.

## Data Requirements

- `content/sources.json` bibliography
- `content/plants.json` plant records
- Fields: identity, names, traditionalUses[], phytochemistry[], bioassays[], cautions[], applicationTags[]
- No user accounts or server database

## User Flow

1. Land on home, read disclaimer, open catalog or consult.
2. Search or filter plants; open a monograph; follow citation chips to Sources.
3. On consult, complete symptom checkboxes, review red flags, see matched plants, open monographs.

## Acceptance Criteria

- At least the 118 Altay Table 2 species are present.
- Skin-review species and Artemisia Table 4/5 species are present and merged on Latin name.
- No plant page invents a use without a source.
- Consult never names a clinical diagnosis such as “psoriasis vulgaris.”
- App builds and runs without environment variables.

## Edge Cases

- No search results
- Consult with only red flags
- Consult with no matching tags
- Plant with only a stub traditional-use row
- Missing AI gateway key (local matcher still works)

## Non-Functional Requirements

- English UI; names shown as published (Latin, Chinese local names from Altay, English when a paper gives them)
- Desktop and mobile layouts
- Next.js, deployable on Vercel later
