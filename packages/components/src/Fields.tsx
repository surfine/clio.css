// Form controls: radio, group box, text field / area, pop-up menu, slider, progress bar. The label
// and the control are siblings (a FieldRow or FieldRow stacked wraps them), tied by id/htmlFor.
import type { Attrs, Node } from "clio-jsx";
import { cx } from "./cx.ts";

export type RadioProps = Omit<Attrs<"input">, "type" | "role"> & { label: Node };

export function Radio({ label, ...input }: RadioProps) {
  return (
    <label>
      <input {...input} type="radio" /> {label}
    </label>
  );
}

export type FieldsetProps = Omit<Attrs<"fieldset">, "title"> & { legend: Node };

export function Fieldset({ legend, children, ...rest }: FieldsetProps) {
  return (
    <fieldset {...rest}>
      <legend>{legend}</legend>
      {children}
    </fieldset>
  );
}

export type TextFieldProps = Omit<Attrs<"input">, "type" | "role"> & {
  label?: Node;
  type?: "text" | "search" | "password" | "email" | "url" | "tel" | "number";
};

export function TextField({ label, type = "text", id, ...input }: TextFieldProps) {
  return (
    <>
      {label != null && <label htmlFor={id}>{label}</label>}
      <input {...input} id={id} type={type as "text"} />
    </>
  );
}

export type TextAreaProps = Attrs<"textarea"> & { label?: Node };

export function TextArea({ label, id, ...area }: TextAreaProps) {
  return (
    <>
      {label != null && <label htmlFor={id}>{label}</label>}
      <textarea {...area} id={id} />
    </>
  );
}

export type SelectProps = Attrs<"select"> & { label?: Node };

/** The pop-up menu: a native <select>; pass <option>s as children. */
export function Select({ label, id, ...select }: SelectProps) {
  return (
    <>
      {label != null && <label htmlFor={id}>{label}</label>}
      <select {...select} id={id} />
    </>
  );
}

export type SliderProps = Omit<Attrs<"input">, "type" | "role"> & {
  /** Draw this many tick marks (sets --clio-slider-tick-count). */
  ticks?: number;
};

export function Slider({ ticks, className, style, ...input }: SliderProps) {
  const s = ticks === undefined ? style : { ...((style as object | undefined) ?? {}), "--clio-slider-tick-count": String(ticks) };
  return <input {...input} type="range" className={cx(ticks !== undefined && "ticks", className as string) || undefined} style={s as Attrs<"input">["style"]} />;
}

export type ProgressProps = Attrs<"progress">;

/** Progress bar; children are the fallback text ("62%"). Omit `value` for indeterminate. */
export function Progress(props: ProgressProps) {
  return <progress {...props} />;
}
