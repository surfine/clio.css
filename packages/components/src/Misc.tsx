// Small single-element controls and chrome: bevel button, help button, little arrows, chasing
// arrows, image well, balloon, placard, pull-down, disclosure triangle, type scale and scope.
import type { Attrs } from "clio-jsx";
import { cx } from "./cx.ts";

export type BevelButtonProps = Attrs<"button"> & {
  /** A pop-up bevel button (draws the menu arrow). */
  menu?: boolean;
  /** A toggle: present sets aria-pressed. */
  pressed?: boolean;
};

export function BevelButton({ menu, pressed, className, ...rest }: BevelButtonProps) {
  return <button aria-haspopup={menu ? "menu" : undefined} {...rest} aria-pressed={pressed} className={cx("bevel", menu && "menu", className as string)} />;
}

export function HelpButton({ className, ...rest }: Attrs<"button">) {
  return <button aria-label="Help" {...rest} className={cx("help-button", className as string)} />;
}

export type LittleArrowsProps = Omit<Attrs<"span">, "role"> & {
  onIncrease?: () => void;
  onDecrease?: () => void;
  increaseLabel?: string;
  decreaseLabel?: string;
};

/** The paired up/down arrows beside a number field. */
export function LittleArrows({ onIncrease, onDecrease, increaseLabel = "Increase", decreaseLabel = "Decrease", className, ...rest }: LittleArrowsProps) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: the ARIA role is part of clio.css's markup contract (clio.js and the stylesheet select on it)
    <span {...rest} role="group" className={cx("little-arrows", className as string)}>
      <button className="up" aria-label={increaseLabel} onClick={onIncrease} />
      <button className="down" aria-label={decreaseLabel} onClick={onDecrease} />
    </span>
  );
}

/** The busy indicator; label it with aria-label. */
export function ChasingArrows({ className, ...rest }: Omit<Attrs<"span">, "role">) {
  return <span {...rest} role="status" className={cx("chasing-arrows", className as string)} />;
}

export function ImageWell({ className, ...rest }: Attrs<"div">) {
  return <div {...rest} className={cx("image-well", className as string)} />;
}

/** Help balloon (Balloon Help). */
export function Balloon({ className, ...rest }: Omit<Attrs<"div">, "role">) {
  return <div {...rest} role="tooltip" className={cx("balloon", className as string)} />;
}

/** A status placard at a window's edge ("Page 1"). */
export function Placard({ className, ...rest }: Omit<Attrs<"span">, "role">) {
  return <span {...rest} role="status" className={cx("placard", className as string)} />;
}

export type PullDownProps = Attrs<"button"> & { open?: boolean };

/** NeXTSTEP pull-down list button. */
export function PullDown({ open, className, ...rest }: PullDownProps) {
  return <button aria-haspopup="menu" aria-expanded={!!open} {...rest} className={cx("pull-down", className as string)} />;
}

export type DisclosureProps = Attrs<"button"> & { expanded?: boolean };

/** The disclosure triangle button (for the native <details>, clio.css styles <summary> itself). */
export function Disclosure({ expanded, className, ...rest }: DisclosureProps) {
  return <button {...rest} aria-expanded={!!expanded} className={cx("disclosure", className as string)} />;
}

/** Scope element: the era's tokens and font apply inside it. */
export function ClioScope({ className, ...rest }: Attrs<"div">) {
  return <div {...rest} className={cx("clio", className as string)} />;
}

/** A scrolling region drawn with the era's scroll bars. */
export function ScrollArea({ className, ...rest }: Attrs<"div">) {
  return <div {...rest} className={cx("clio", "clio-scroll", className as string)} />;
}

export type TextProps = Attrs<"p"> & {
  variant: "heading" | "text" | "display";
  as?: "p" | "h1" | "h2" | "h3" | "h4" | "span" | "div";
};

/** Type scale: heading (system font), text (application font) or display (any other size). */
export function Text({ variant, as = "p", className, ...rest }: TextProps) {
  const Tag = as as "p";
  return <Tag {...rest} className={cx(variant, className as string)} />;
}
