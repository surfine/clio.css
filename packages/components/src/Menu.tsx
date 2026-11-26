// Menu bar and its menus. clio.js tracks the open menu and keyboard; these render the markup.
// MenuBarItem is one title in the bar (`open` shows its menu, `children` are MenuItems).
import type { Attrs, Node } from "clio-jsx";
import { cx } from "./cx.ts";

export type MenuBarProps = Attrs<"ul">;

export function MenuBar({ className, ...rest }: MenuBarProps) {
  // biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: the ARIA role is part of clio.css's markup contract (clio.js and the stylesheet select on it)
  return <ul role="menubar" {...rest} className={cx("menu-bar", className as string)} />;
}

export type MenuBarItemProps = Omit<Attrs<"li">, "title"> & { label: Node; open?: boolean; buttonProps?: Attrs<"button"> };

export function MenuBarItem({ label, open, buttonProps, children, className, ...rest }: MenuBarItemProps) {
  return (
    <li role="none" {...rest} className={cx(open && "open", className as string) || undefined}>
      <button role="menuitem" aria-haspopup="true" aria-expanded={!!open} {...buttonProps}>{label}</button>
      {/* biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: the ARIA role is part of clio.css's markup contract (clio.js and the stylesheet select on it) */}
      {children != null && children !== false && <ul className="menu" role="menu">{children}</ul>}
    </li>
  );
}

export type MenuItemProps = Omit<Attrs<"button">, "role" | "type"> & {
  /** A trailing shortcut, drawn as <kbd>. */
  shortcut?: Node;
  /** Present: a check-mark item (menuitemcheckbox) with this state. */
  checked?: boolean;
  disabled?: boolean;
};

export function MenuItem({ shortcut, checked, disabled, children, ...rest }: MenuItemProps) {
  const check = checked !== undefined;
  return (
    <li role="none">
      {/* biome-ignore lint/a11y/useAriaPropsSupportedByRole: the ARIA role is part of clio.css's markup contract (clio.js and the stylesheet select on it) */}
      <button {...rest} role={check ? "menuitemcheckbox" : "menuitem"} aria-checked={check ? checked : undefined} aria-disabled={disabled ? true : undefined}>
        {children}
        {shortcut != null && <> <kbd>{shortcut}</kbd></>}
      </button>
    </li>
  );
}

export function MenuSeparator() {
  // biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: the ARIA role is part of clio.css's markup contract (clio.js and the stylesheet select on it)
  // biome-ignore lint/a11y/useSemanticElements: the ARIA role is part of clio.css's markup contract (clio.js and the stylesheet select on it)
  return <li role="separator" />;
}
