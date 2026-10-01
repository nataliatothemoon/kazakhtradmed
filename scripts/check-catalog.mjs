import { readFileSync } from "node:fs";

const plants = JSON.parse(readFileSync(new URL("../content/plants.json", import.meta.url)));
const errors = [];

function fail(message) {
  errors.push(message);
}

const banned = [/steppe heat/i, /stagnant dampness/i, /psoriasis vulgaris/i, /shypagerlik/i];
const zhao = plants.filter((plant) =>
  plant.traditionalUses.some((use) => use.sourceId === "zhao-2025"),
);
if (zhao.length !== 118) fail(`expected 118 Altay species, found ${zhao.length}`);

const skin = plants.filter((plant) =>
  plant.traditionalUses.some((use) => use.sourceId === "berganayeva-2023"),
);
if (skin.length < 30) fail(`expected 30 skin-review species, found ${skin.length}`);

let assays = 0;
for (const plant of plants) {
  const blob = JSON.stringify(plant);
  for (const pattern of banned) {
    if (pattern.test(blob)) fail(`${plant.id} contains banned phrase ${pattern}`);
  }
  for (const use of plant.traditionalUses) {
    if (!use.locator) fail(`${plant.id} traditional use missing locator`);
    if (use.sourceId === "berganayeva-2023") {
      if (use.condition.length === 400) fail(`${plant.id} skin use is cut at 400 characters`);
      if (!/[.!?]$/.test(use.condition)) fail(`${plant.id} skin use does not end as a sentence`);
    }
  }
  for (const row of [...plant.phytochemistry, ...plant.cautions]) {
    if (!row.locator) fail(`${plant.id} row missing locator`);
  }
  for (const assay of plant.bioassays) {
    assays += 1;
    if (!assay.locator) fail(`${plant.id} assay missing locator`);
    if (!assay.concentration) fail(`${plant.id} ${assay.target} missing concentration`);
    if (!assay.extract) fail(`${plant.id} ${assay.target} missing extract`);
    if (assay.locator === "Tables 4–5") fail(`${plant.id} assay locator was not split`);
    if (/aerial parts/i.test(assay.extract)) {
      fail(`${plant.id} assay extract says aerial parts, which the methods section does not`);
    }
  }
}

const scopae = plants.find((plant) => plant.id === "artemisia-scopaeformis");
const glucosidase = scopae?.bioassays.find((assay) => assay.target === "alpha-glucosidase");
if (!glucosidase || glucosidase.value !== 83.1 || glucosidase.locator !== "Table 4") {
  fail("A. scopaeformis alpha-glucosidase is not the Table 4 value 83.1%");
}
if (assays !== 77) fail(`expected 77 assay rows, found ${assays}`);

const capsella = plants.find((plant) => plant.id === "capsella-bursa-pastoris");
const capsellaZhao = capsella?.traditionalUses.find((use) => use.sourceId === "zhao-2025");
if (!capsellaZhao?.preparation.includes("mild skin discomfort")) {
  fail("Capsella Zhao preparation is still truncated");
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(
  `catalog ok: ${plants.length} plants, ${zhao.length} Altay, ${skin.length} skin-review, ${assays} assays`,
);
