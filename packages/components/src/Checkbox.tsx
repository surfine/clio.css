// Check box: a native <input type=checkbox> inside its <label>; every other prop goes to the input.
import type { Attrs, Node } from "clio-jsx";

export type CheckboxProps = Omit<Attrs<"input">, "type" | "role"> & { label: Node };

export function Checkbox({ label, ...input }: CheckboxProps) {
  return (
    <label>
      <input {...input} type="checkbox" /> {label}
    </label>
  );
}
