export type SourceId =
  | "zhao-2025"
  | "berganayeva-2023"
  | "nurlybekova-2022"
  | "berganayeva-preprint-2023";

export type SourceRecord = {
  id: SourceId;
  shortTitle: string;
  title: string;
  authors: string;
  year: number;
  journal: string;
  doi: string;
  url: string;
  license: string;
  canonical: boolean;
  role: string;
  duplicateOf: SourceId | null;
};

export type TraditionalUse = {
  community: string;
  condition: string;
  preparation: string;
  partUsed: string;
  foodUse: string;
  foodPart: string;
  intent: string;
  useValue: number | null;
  sourceId: SourceId;
  locator: string;
};

export type Phytochemical = {
  compound: string;
  class: string;
  amount: string;
  extract: string;
  sourceId: SourceId;
  locator: string;
};

export type Bioassay = {
  target: string;
  metric: string;
  value: number;
  unit: string;
  concentration: string;
  extract: string;
  sourceId: SourceId;
  locator: string;
};

export type Caution = {
  text: string;
  sourceId: SourceId;
  locator: string;
};

export type Plant = {
  id: string;
  scientificName: string;
  family: string;
  names: {
    scientific: string;
    english: string;
    chinese: string;
    kazakh: string;
  };
  habit: string;
  harvestStatus: string;
  regions: string[];
  voucher: string;
  traditionalUses: TraditionalUse[];
  phytochemistry: Phytochemical[];
  bioassays: Bioassay[];
  cautions: Caution[];
  applicationTags: string[];
};
