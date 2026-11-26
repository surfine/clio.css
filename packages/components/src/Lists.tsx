// Lists: list box (and the NeXTSTEP browser of list boxes), the Finder list view's table parts.
import type { Attrs } from "clio-jsx";
import { cx } from "./cx.ts";

export type ListboxProps = Omit<Attrs<"ul">, "role">;

export function Listbox({ className, ...rest }: ListboxProps) {
  // biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: the ARIA role is part of clio.css's markup contract (clio.js and the stylesheet select on it)
  return <ul {...rest} role="listbox" className={cx("listbox", className as string)} />;
}

export type ListboxOptionProps = Omit<Attrs<"li">, "role"> & {
  selected?: boolean;
  /** NeXTSTEP browser: the row opens a column to its right. */
  branch?: boolean;
};

export function ListboxOption({ selected, branch, className, ...rest }: ListboxOptionProps) {
  // biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: the ARIA role is part of clio.css's markup contract (clio.js and the stylesheet select on it)
  // biome-ignore lint/a11y/useFocusableInteractive: the ARIA role is part of clio.css's markup contract (clio.js and the stylesheet select on it)
  return <li {...rest} role="option" aria-selected={selected || undefined} className={cx(branch && "branch", className as string) || undefined} />;
}

/** NeXTSTEP browser: columns of list boxes side by side. */
export function Browser({ className, ...rest }: Attrs<"div">) {
  return <div {...rest} className={cx("browser", className as string)} />;
}

export function ListView({ className, ...rest }: Attrs<"table">) {
  return <table {...rest} className={cx("list-view", className as string)} />;
}

export type ListViewHeaderProps = Attrs<"th"> & { sort?: "ascending" | "descending" };

/** A column header; `sort` marks the sorted column. */
export function ListViewHeader({ sort, ...rest }: ListViewHeaderProps) {
  return <th {...rest} aria-sort={sort} />;
}

/** The header cell that carries the sort-direction arrow. */
export function SortDirectionHeader({ className, ...rest }: Attrs<"th">) {
  return <th aria-label="Sort direction" {...rest} className={cx("sort-direction", className as string)} />;
}

export function ListViewCell({ sorted, className, ...rest }: Attrs<"td"> & { sorted?: boolean }) {
  return <td {...rest} className={cx(sorted && "sorted", className as string) || undefined} />;
}
