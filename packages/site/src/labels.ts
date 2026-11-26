// How the evidence table and EVIDENCE.md name an era and a status.
import type { Era, EvidenceStatus } from "../../core/src/types.ts";

export const ERA: Record<Era, string> = { system6: "System 6", system7: "System 7", drawingboard: "Drawing Board", platinum: "Platinum", nextstep: "NeXTSTEP", both: "Classic eras" };
export const STATUS: Record<EvidenceStatus, string> = {
  measured: "Measured",
  inferred: "Inferred",
  adapted: "Adapted",
  "third-party": "Third-party",
};
