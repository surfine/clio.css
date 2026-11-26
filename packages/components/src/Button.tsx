// Push button: the native <button>. `default` draws the default ring (Return clicks it under
// clio.js), `pressed` the held look for a specimen; disabled is the native attribute.
import type { Attrs } from "clio-jsx";
import { cx } from "./cx.ts";

export type ButtonProps = Attrs<"button"> & { default?: boolean; pressed?: boolean };

export function Button({ default: isDefault, pressed, className, ...rest }: ButtonProps) {
  return <button {...rest} className={cx(isDefault && "default", pressed && "active", className as string) || undefined} />;
}
