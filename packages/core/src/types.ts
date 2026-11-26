// Shapes of the component index. P3 turns each component's data into its own typed
// module; until then these types keep `tsc` honest about the data that build, site and
// check read. They are type-only: Node strips them and nothing reaches the output.

export type Era = "system6" | "system7" | "drawingboard" | "platinum" | "nextstep" | "both";

export type EvidenceStatus = "measured" | "inferred" | "adapted" | "third-party";

export interface Evidence {
  era: Era;
  claim: string;
  status: EvidenceStatus;
  /** Where the value lives in AI System 6, or the capture it was read from. */
  source: string;
  /** What the row is checked against: the capture, the guideline, the script. */
  upstream: string;
}

export interface Variant {
  name: string;
  note: string;
  html: string;
}

export interface Component {
  id: string;
  name: string;
  summary: string;
  selectors: string[];
  tokens: string[];
  accessibility: string;
  html: string;
  evidence: Evidence[];
  variants?: Variant[];
  /** system.css / AI System 6 markup spellings the docs list. */
  aliases?: Record<string, string[]>;
  /** The example is already a page-width specimen (menu bar, desktop). */
  bare?: boolean;
  /** Minimum height for a specimen whose art needs room. */
  reserveHeight?: number;
  /** Present when a component ships in one era only (NeXTSTEP). */
  eras?: Era[];
}

/** The fields of package.json the renderers read. */
export interface PackageInfo {
  name: string;
  version: string;
  description: string;
  homepage: string;
  license: string;
  keywords: string[];
  repository: { url: string };
}
