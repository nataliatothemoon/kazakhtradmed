#!/usr/bin/env python3
"""Rebuild Berganayeva traditional uses from the published PDF text layer.

Assay numbers are checked against Nurlybekova Tables 4 and 5. Zhao Table 2
rows stay as encoded, except three preparations that were cut at a page break.
"""

from __future__ import annotations

import json
import re
from collections import defaultdict
from pathlib import Path

from pdfminer.high_level import extract_pages
from pdfminer.layout import LTAnno, LTChar

ROOT = Path(__file__).resolve().parents[1]
PLANTS_PATH = ROOT / "content" / "plants.json"
SKIN_PDF = ROOT / "content" / "sources" / "berganayeva-2023-molecules-28-04192.pdf"

LAB = re.compile(
    r"IC50|IC₅₀|µg/mL|mg/mL|fibroblast|cytokine|macrophage|lipopolysaccharide|"
    r"NF-κB|NF-kB|in vitro|in vivo|cell line|\bmice\b|\bmouse\b|proliferation|"
    r"keratinocyte|Psilo-Balsam|Celestoderm|IL-\d+|fumarate",
    re.I,
)
USE = re.compile(
    r"traditional|folk medicine|administered|infusion|decoction|ointment|"
    r"poultice|compress|tincture|potion|dermatolog|used externally|"
    r"applied externally|has been used|have been used|has been employed|"
    r"have been employed|were employed|was employed|remedy for|\bbaths?\b|"
    r"has long been utilized|is utilized|are utilized|is employed|are employed|"
    r"widely employed|were used|was used|is used|treatment is carried out|"
    r"effective medicinal plant",
    re.I,
)
MECHANISM = re.compile(
    r"due to the content|pharmacological activit|potential activity|"
    r"mechanism of action|study results|demonstrated that",
    re.I,
)
PREP_WORDS = [
    ("infusions, extracts, and potions", r"infusions, extracts, and potions"),
    ("infusion", r"\binfusions?\b"),
    ("decoction", r"\bdecoctions?\b"),
    ("ointment", r"\bointments?\b"),
    ("tincture", r"\btinctures?\b"),
    ("poultice", r"\bpoultices?\b"),
    ("compress", r"\bcompress(?:es)?\b"),
    ("lotion", r"\blotions?\b"),
    ("bath", r"\bbaths?\b"),
    ("wipe", r"\bwipes?\b"),
    ("tea", r"\btea\b"),
    ("powder", r"\bpowder\b"),
    ("balm", r"\bbalms?\b"),
    ("administered orally", r"\borally\b"),
    ("external application", r"\bexternally\b"),
]
PART_WORDS = [
    "aerial parts",
    "aerial part",
    "aboveground parts",
    "aboveground part",
    "inflorescences",
    "inflorescence",
    "rhizomes",
    "rhizome",
    "flowers",
    "flower",
    "leaves",
    "leaf",
    "stems",
    "stem",
    "roots",
    "root",
    "seeds",
    "seed",
    "fruit",
    "bark",
    "herb",
    "whole plant",
]
TAG_RULES = [
    ("eczema", r"eczema|dermatitis"),
    ("psoriasis", r"psoriasis"),
    ("acne", r"acne|boils|pyoderma|furuncul"),
    ("itching", r"itch"),
    ("wounds", r"wound|burn"),
    ("weeping", r"weep|oozing|exudat"),
    ("dryness", r"alopecia|hair loss|dry skin|dandruff"),
    ("digestive", r"digest|stomach|dyspepsia|gastro|liver|bile|helminth|laxative|constipat"),
    ("fever", r"fever|antipyretic"),
    ("respiratory", r"asthma|bronch|respiratory|\bcough\b|\blung"),
    ("bleeding", r"bleed|hemost"),
    ("urinary", r"urin|diuretic|\bkidney"),
    ("skin", r"\bskin\b|dermatolog"),
]
ENZYME_TAGS = {
    "alpha-glucosidase": "enzyme:alpha-glucosidase",
    "PTP1B": "enzyme:PTP1B",
    "BNA": "enzyme:BNA",
}


def published_skin_text() -> str:
    pages: list[str] = []
    for page in extract_pages(str(SKIN_PDF)):
        chars: list[LTChar] = []

        def walk(obj):
            if isinstance(obj, LTChar) and "Palladio" in (obj.fontname or ""):
                chars.append(obj)
            elif hasattr(obj, "__iter__") and not isinstance(obj, (str, LTChar, LTAnno)):
                for child in obj:
                    walk(child)

        walk(page)
        chars.sort(key=lambda char: (-round(char.y0, 0), char.x0))
        lines: list[list[LTChar]] = []
        current: list[LTChar] = []
        current_y = None
        for char in chars:
            y = round(char.y0, 0)
            if current_y is None or abs(y - current_y) <= 1:
                current.append(char)
                current_y = y if current_y is None else current_y
            else:
                lines.append(current)
                current = [char]
                current_y = y
        if current:
            lines.append(current)
        page_lines = []
        for line in lines:
            line.sort(key=lambda char: char.x0)
            bits: list[str] = []
            prev = None
            for char in line:
                if prev is not None and char.x0 - prev.x1 > 1.25:
                    bits.append(" ")
                bits.append(char.get_text())
                prev = char
            text = "".join(bits).strip()
            if not text or text.startswith("Molecules 2023") or re.fullmatch(r"\d+ of 50", text):
                continue
            page_lines.append(text)
        pages.append("\n".join(page_lines))
    full = "\n".join(pages)
    full = re.sub(r"-\n(?=[a-z])", "", full)
    full = re.sub(r"(?<![A-Za-z])-[Aa]zarone", "β-azarone", full)
    return full


def prose_of(section: str) -> str:
    lines = []
    for line in section.splitlines():
        line = line.strip()
        if not line or line.startswith("Figure ") or line.startswith("===== PAGE"):
            continue
        lines.append(line)
    prose = " ".join(lines[1:])
    prose = re.sub(r"\s+", " ", prose).strip()
    prose = prose.replace("antiinﬂammatory", "anti-inﬂammatory")
    prose = prose.replace("antiinflammatory", "anti-inflammatory")
    prose = prose.replace("woundhealing", "wound-healing")
    prose = prose.replace("ﬁ", "fi").replace("ﬂ", "fl")
    prose = re.sub(r"\]:\s+(?=[A-Z])", "]. ", prose)
    prose = re.sub(r"\]\s+(?=[A-Z])", "]. ", prose)
    return prose


def sentences_of(prose: str) -> list[str]:
    protected = re.sub(r"\b([A-Z])\.", r"\1<prd>", prose)
    for token in ("et al.", "Fig.", "Figs.", "Dr.", "vs.", "e.g.", "i.e."):
        protected = protected.replace(token, token.replace(".", "<prd>"))
    parts = re.split(r"(?<=[.!?])\s+", protected)
    cleaned = []
    for part in parts:
        part = part.replace("<prd>", ".")
        part = re.sub(r"\s*\[[^\]]+\]", "", part)
        part = re.sub(r"\s+", " ", part).strip()
        if part:
            cleaned.append(part)
    return cleaned


def is_traditional(sentence: str) -> bool:
    if not (55 <= len(sentence) <= 700):
        return False
    if not sentence.endswith((".", "!", "?")):
        return False
    if LAB.search(sentence) or MECHANISM.search(sentence):
        return False
    if sentence.lower().startswith(("figure ", "table ")):
        return False
    if sentence[0].islower():
        return False
    if re.search(r"\b[A-Z]\.$", sentence):
        return False
    if re.search(
        r"oil production|doxorubicin|tumor cell|guinea pig|probiotic|"
        r"potential remedy|potential applications|recent studies|homeopathy$|"
        r"has been shown",
        sentence,
        re.I,
    ):
        return False
    return bool(USE.search(sentence))


def preparation_of(sentence: str) -> str:
    found = []
    for label, pattern in PREP_WORDS:
        if re.search(pattern, sentence, re.I):
            found.append(label)
    # Prefer the more specific combined phrase over its parts.
    if "infusions, extracts, and potions" in found:
        found = [item for item in found if item not in {"infusion"}]
    return "; ".join(dict.fromkeys(found))


def part_of(sentence: str) -> str:
    lowered = sentence.lower()
    found = []
    for part in PART_WORDS:
        if part in lowered and not any(part != other and part in other and other in found for other in found):
            if any(existing in part and existing in found for existing in found):
                found = [existing for existing in found if existing not in part]
            found.append(part)
    return ", ".join(found)


def compounds_of(sentence: str) -> list[tuple[str, str]]:
    if not re.search(
        r"\b(components|contains|contain|composition|consists of|rich in|includes|isolated)\b",
        sentence,
        re.I,
    ):
        return []
    chunk = sentence
    if ":" in sentence and sentence.index(":") < 120:
        chunk = sentence.split(":", 1)[1]
    rows = []
    for raw in re.split(r",|;| and ", chunk):
        piece = re.sub(r"\([^)]*\)", "", raw)
        piece = re.sub(r"\[[^\]]*\]", "", piece)
        piece = piece.strip(" .:-")
        if not (3 <= len(piece) <= 42):
            continue
        if re.search(
            r"\b(the|this|which|with|from|that|their|been|have|used|treatment|disease|including|such|figure)\b",
            piece,
            re.I,
        ):
            continue
        if piece[0] in "-–" or piece[0].isupper():
            continue
        if re.search(r"[\d()\[\]]", piece):
            continue
        if piece.lower() in {"respectively", "others", "among others"}:
            continue
        if ":" in piece:
            continue
        words = piece.split()
        if len(words) > 3:
            continue
        if words[0].lower() in {
            "it",
            "display",
            "significant",
            "other",
            "a",
            "the",
            "monoterpenoids",
            "as",
            "of",
            "in",
            "by",
            "for",
            "well",
        }:
            continue
        if re.search(
            r"disease|dermatitis|acne|swelling|redness|effects|beneficial|coffee",
            piece,
            re.I,
        ):
            continue
        amount = ""
        match = re.search(rf"{re.escape(piece)}[^\d%]{{0,24}}(\d+(?:\.\d+)?%)", sentence, re.I)
        if match:
            amount = match.group(1)
        rows.append((piece, amount))
    return rows


def caution_of(sentence: str) -> str | None:
    if LAB.search(sentence):
        return None
    if re.search(r"carcinogenic|\bpoisonous\b|contraindicat", sentence, re.I):
        if 60 <= len(sentence) <= 500 and sentence.endswith((".", "!", "?")):
            if " but " in sentence and "carcinogenic" in sentence.lower():
                sentence = sentence.split(" but ", 1)[1].strip()
                sentence = sentence[0].upper() + sentence[1:]
                if sentence.lower().startswith("it has"):
                    sentence = "β-Azarone " + sentence[3:]
                if not sentence.endswith("."):
                    sentence += "."
            return sentence
    return None


def epithet(name: str) -> tuple[str, str] | None:
    cleaned = name.replace("ﬁ", "fi").replace("ﬂ", "fl")
    match = re.search(r"([A-Z][a-z]+)\s+([a-z-]+)", cleaned)
    if not match:
        return None
    return match.group(1).lower(), match.group(2).lower()


def use_row(sentence: str, locator: str) -> dict:
    return {
        "community": "Kazakhstan flora, as reviewed by Berganayeva et al. 2023",
        "condition": sentence,
        "preparation": preparation_of(sentence),
        "partUsed": part_of(sentence),
        "foodUse": "",
        "foodPart": "",
        "intent": "medicine",
        "useValue": None,
        "sourceId": "berganayeva-2023",
        "locator": locator,
    }


def sections(text: str) -> list[tuple[str, str]]:
    cut = text.find("\n2. Discussion")
    body = text[:cut] if cut > 0 else text
    parts = re.split(r"\n(?=\d+\.\d+\. )", body)
    found = []
    for part in parts:
        if not re.match(r"\d+\.\d+\.", part.strip()):
            continue
        head = part.splitlines()[0].strip()
        locator = head.split(" Family")[0].split(" family")[0].strip()
        found.append((locator, prose_of(part)))
    return found


def tags_for(plant: dict) -> list[str]:
    blob = " ".join(
        f"{use['condition']} {use['preparation']}" for use in plant["traditionalUses"]
    )
    tags = []
    for tag, pattern in TAG_RULES:
        if re.search(pattern, blob, re.I):
            tags.append(tag)
    for assay in plant["bioassays"]:
        enzyme = ENZYME_TAGS.get(assay["target"])
        if enzyme:
            tags.append(enzyme)
        if assay["target"] in {"DPPH", "ABTS", "TPC", "TFC"}:
            tags.append("antioxidant")
        if assay["target"] in {"alpha-glucosidase", "PTP1B"}:
            tags.append("metabolic")
    return sorted(set(tags))


def fix_assays(plant: dict) -> None:
    for assay in plant["bioassays"]:
        if assay["sourceId"] != "nurlybekova-2022":
            continue
        assay["extract"] = "methanol extract of dried plant material (1 g in 50 mL)"
        if assay["target"] in {"alpha-glucosidase", "PTP1B", "BNA"}:
            assay["locator"] = "Table 4"
        elif assay["target"] in {"TPC", "TFC", "DPPH", "ABTS"}:
            assay["locator"] = "Table 5"
            assay["concentration"] = "IC50 of the methanol extract" if assay["metric"] == "IC50" else "methanol extract"


def zhao_use(plant: dict) -> dict | None:
    return next((use for use in plant["traditionalUses"] if use["sourceId"] == "zhao-2025"), None)


def fix_zhao(plants: list[dict]) -> None:
    by_id = {plant["id"]: plant for plant in plants}
    capsella = by_id["capsella-bursa-pastoris"]
    use = zhao_use(capsella)
    if use:
        use["preparation"] = "Mashing for external use to relieve mild skin discomfort"
    ferula = by_id["ferula-lehmannii-boiss"]
    use = zhao_use(ferula)
    if use:
        use["condition"] = "Digesting accumulation, vermifuge"
        use["preparation"] = (
            "Proper amount of asafoetida gum, grind it and add to plaster for external "
            "application on the affected area; boiling asafoetida gum together with mutton, and drink the soup"
        )
        use["partUsed"] = "Root, resin"
        use["foodUse"] = "Vegetable"
        use["foodPart"] = "Stem, leaf"
    medicago = by_id["medicago-sativ-a"]
    medicago["scientificName"] = "Medicago sativa L"
    medicago["names"]["scientific"] = "Medicago sativa L"
    use = zhao_use(medicago)
    if use:
        use["condition"] = "Clearing stomach heat"
        use["preparation"] = "Decocting with water; extracting juice for oral administration"
    for plant in plants:
        for use in plant["traditionalUses"]:
            if use["sourceId"] != "zhao-2025":
                continue
            prep = use["preparation"].replace("Decocting with water with water", "decocting with water")
            prep = prep.replace("Decoct- ing with water", "decocting with water")
            use["preparation"] = re.sub(r"\s+", " ", prep).strip()


def nurlybekova_use(condition: str, preparation: str, part: str, locator: str) -> dict:
    return {
        "community": "Traditional Kazakh and Central Asian use, as stated by Nurlybekova et al. 2022",
        "condition": condition,
        "preparation": preparation,
        "partUsed": part,
        "foodUse": "",
        "foodPart": "",
        "intent": "medicine",
        "useValue": None,
        "sourceId": "nurlybekova-2022",
        "locator": locator,
    }


def blank_plant(plant_id: str, scientific: str, family: str, english: str, regions: list[str]) -> dict:
    return {
        "id": plant_id,
        "scientificName": scientific,
        "family": family,
        "names": {"scientific": scientific, "english": english, "chinese": "", "kazakh": ""},
        "habit": "",
        "harvestStatus": "",
        "regions": regions,
        "voucher": "",
        "traditionalUses": [],
        "phytochemistry": [],
        "bioassays": [],
        "cautions": [],
        "applicationTags": [],
    }


def fix_nurlybekova(plants: list[dict]) -> None:
    by_id = {plant["id"]: plant for plant in plants}
    absinthium = by_id["artemisia-absinthium"]
    absinthium["traditionalUses"] = [
        use
        for use in absinthium["traditionalUses"]
        if use["sourceId"] != "nurlybekova-2022"
    ]
    cina = by_id["artemisia-cina-berg-et"]
    cina["traditionalUses"] = [
        nurlybekova_use(
            "Known in Kazakh as dermene. Its inflorescences have been used since ancient times by Kazakhs for helminthiasis, asthma, and bronchitis, and the plant was used for many years to treat parasitological diseases.",
            "Inflorescences",
            "inflorescences",
            "Section 3",
        ),
        nurlybekova_use(
            "For asthma, bronchitis, and inflammatory diseases, boiled A. cina seeds are drunk. Seeds crushed and mixed with raisins are used to treat lung diseases. Leaves are collected before the flower opens, then flowers and stems are harvested.",
            "Boiled seeds; seeds crushed and mixed with raisins",
            "leaves, flowers, stems, seeds",
            "Section 1",
        ),
    ]
    rupestris = by_id["artemisia-rupestris"]
    rupestris["names"]["kazakh"] = "Kyeli-Ermen"
    rupestris["traditionalUses"] = [
        nurlybekova_use(
            "In Kazakh culture it is known as Kyeli-Ermen. It is used in traditional Kazakh medicine to reduce fever in infectious and inflammatory diseases, improve gallbladder function, reduce stomach inflammation, and relieve nausea.",
            "",
            "herb",
            "Section 3",
        ),
        nurlybekova_use(
            "In ancient Kazakh practice, A. rupestris was prepared and drunk as tea for cancer, stomach pain, indigestion, jaundice, flu, urticaria, and various types of hepatitis.",
            "Tea",
            "herb",
            "Section 3",
        ),
        nurlybekova_use(
            "The crude extract obtained from A. rupestris tea by evaporation is used to treat skin diseases such as neurodermatitis, poisonous insect bites, and skin lesions.",
            "Evaporated tea extract",
            "herb",
            "Section 3",
        ),
    ]
    trans = by_id["artemisia-transiliensis-poljakov"]
    trans["traditionalUses"] = [
        use for use in trans["traditionalUses"] if use["sourceId"] != "nurlybekova-2022"
    ]
    trans["traditionalUses"].append(
        nurlybekova_use(
            "Artemisia transiliensis has long been used as an anti-germ agent. It is an endemic species of the loess foothills of the Zaili Alatau in the Alma-Ata region.",
            "",
            "",
            "Section 3",
        )
    )
    trans["regions"] = sorted(set(trans["regions"] + ["Zaili Alatau, Alma-Ata region"]))
    additions = [
        blank_plant(
            "artemisia-sieversiana",
            "Artemisia sieversiana Ehrh.",
            "Asteraceae",
            "sage sivers",
            ["Central Kazakhstan"],
        ),
        blank_plant(
            "artemisia-frigida",
            "Artemisia frigida Willd.",
            "Asteraceae",
            "sacred kermek",
            ["Kazakhstan (traditional Kazakh medicine)"],
        ),
        blank_plant(
            "artemisia-annua",
            "Artemisia annua L.",
            "Asteraceae",
            "",
            ["Kazakhstan and Central Asia"],
        ),
    ]
    additions[0]["traditionalUses"] = [
        nurlybekova_use(
            "Infusions and decoctions of the inflorescences, roots, and aerial parts are used in folk and Tibetan medicine for bronchitis and cough. An infusion of the herb is used as a diaphoretic for fever and colds, to improve appetite and gastrointestinal activity, as an antihelminthic, and for constipation.",
            "Infusions and decoctions",
            "inflorescences, roots, aerial parts",
            "Section 3",
        )
    ]
    additions[1]["traditionalUses"] = [
        nurlybekova_use(
            "Known in traditional Kazakh medicine as sacred kermek. The aboveground part is used for stomach discomfort, inflammation of the internal organs, skin diseases, and to improve gallbladder function.",
            "",
            "aboveground part",
            "Section 3",
        )
    ]
    additions[2]["traditionalUses"] = [
        nurlybekova_use(
            "The decoction of the aerial part has been used in traditional Kazakh medicine for its antipyretic properties and to treat indigestion, constipation, and skin diseases.",
            "Decoction",
            "aerial part",
            "Section 3",
        )
    ]
    known = {plant["id"] for plant in plants}
    for plant in additions:
        if plant["id"] not in known:
            plants.append(plant)


def apply_skin(plants: list[dict], text: str) -> None:
    by_key = {}
    for plant in plants:
        key = epithet(plant["scientificName"])
        if key:
            by_key[key] = plant
    for plant in plants:
        plant["traditionalUses"] = [
            use for use in plant["traditionalUses"] if use["sourceId"] != "berganayeva-2023"
        ]
        plant["phytochemistry"] = [
            row for row in plant["phytochemistry"] if row["sourceId"] != "berganayeva-2023"
        ]
        plant["cautions"] = [row for row in plant["cautions"] if row["sourceId"] != "berganayeva-2023"]

    for locator, prose in sections(text):
        key = epithet(locator)
        if not key or key not in by_key:
            raise SystemExit(f"No catalog plant for {locator}")
        plant = by_key[key]
        seen_compounds = set()
        for sentence in sentences_of(prose):
            if is_traditional(sentence):
                plant["traditionalUses"].append(use_row(sentence, locator))
            caution = caution_of(sentence)
            if caution:
                plant["cautions"].append(
                    {"text": caution, "sourceId": "berganayeva-2023", "locator": locator}
                )
            for compound, amount in compounds_of(sentence):
                marker = compound.lower()
                if marker in seen_compounds:
                    continue
                seen_compounds.add(marker)
                plant["phytochemistry"].append(
                    {
                        "compound": compound,
                        "class": "",
                        "amount": amount,
                        "extract": "",
                        "sourceId": "berganayeva-2023",
                        "locator": locator,
                    }
                )
        if not any(use["sourceId"] == "berganayeva-2023" for use in plant["traditionalUses"]):
            raise SystemExit(f"No traditional-use sentence kept for {locator}")


def main() -> None:
    plants = json.loads(PLANTS_PATH.read_text())
    text = published_skin_text()
    apply_skin(plants, text)
    fix_zhao(plants)
    fix_nurlybekova(plants)
    for plant in plants:
        fix_assays(plant)
        plant["applicationTags"] = tags_for(plant)
    PLANTS_PATH.write_text(json.dumps(plants, ensure_ascii=False, indent=2) + "\n")
    skin_uses = sum(
        1
        for plant in plants
        for use in plant["traditionalUses"]
        if use["sourceId"] == "berganayeva-2023"
    )
    print(f"plants {len(plants)} berganayeva uses {skin_uses}")


if __name__ == "__main__":
    main()
