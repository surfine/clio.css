// Layout rows the control examples sit in: .field-row (inline) and .field-row-stacked.
import type { Attrs } from "clio-jsx";
import { cx } from "./cx.ts";

export type FieldRowProps = Attrs<"div"> & { stacked?: boolean };

export function FieldRow({ stacked, className, ...rest }: FieldRowProps) {
  return <div {...rest} className={cx(stacked ? "field-row-stacked" : "field-row", className as string)} />;
}
