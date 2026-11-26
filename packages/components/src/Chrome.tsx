// Window-like and shell chrome: control strip, desktop and icons, dock, rounded and side-title
// windows, split view.
import type { Attrs, Node } from "clio-jsx";
import { cx } from "./cx.ts";

export type ControlStripProps = Attrs<"div"> & {
  /** Folded to its handle. */
  collapsed?: boolean;
  scrollBackDisabled?: boolean;
  scrollForwardDisabled?: boolean;
  onScrollBack?: () => void;
  onScrollForward?: () => void;
  /** The handle's click (fold or unfold). */
  onToggle?: () => void;
  /** Accessible name of the module toolbar. */
  label?: string;
};

/** Control Strip; children are ControlStripModules. */
export function ControlStrip({ collapsed, scrollBackDisabled, scrollForwardDisabled, onScrollBack, onScrollForward, onToggle, label = "Control Strip", className, children, ...rest }: ControlStripProps) {
  return (
    <div {...rest} className={cx("control-strip", collapsed && "is-collapsed", className as string)}>
      {!collapsed && <button className="control-strip-scroll control-strip-scroll-back" disabled={!!scrollBackDisabled} aria-label="Scroll back" onClick={onScrollBack} />}
      {!collapsed && (
        <div className="control-strip-modules" role="toolbar" aria-label={label}>
          <div className="control-strip-module-track">{children}</div>
        </div>
      )}
      {!collapsed && <button className="control-strip-scroll control-strip-scroll-forward" disabled={!!scrollForwardDisabled} aria-label="Scroll forward" onClick={onScrollForward} />}
      <button className="control-strip-handle" aria-label={collapsed ? "Expand Control Strip" : "Collapse Control Strip"} onClick={onToggle} />
    </div>
  );
}

export type ControlStripModuleProps = Attrs<"button"> & { open?: boolean };

/** One module button; children are its icon (an <svg>). Name it with aria-label. */
export function ControlStripModule({ open, className, ...rest }: ControlStripModuleProps) {
  return <button aria-haspopup="menu" aria-expanded={!!open} {...rest} className={cx("control-strip-module", className as string)} />;
}

export function Desktop({ className, ...rest }: Attrs<"div">) {
  return <div {...rest} className={cx("desktop", className as string)} />;
}

export type DesktopIconProps = Omit<Attrs<"button">, "children"> & {
  label: Node;
  selected?: boolean;
  /** The icon artwork (an <svg>). */
  children?: Node;
};

export function DesktopIcon({ label, selected, children, className, ...rest }: DesktopIconProps) {
  return (
    <button {...rest} aria-pressed={!!selected} className={cx("icon", selected && "selected", className as string)}>
      {children}
      <span>{label}</span>
    </button>
  );
}

/** NeXTSTEP workspace dock. */
export function Dock({ className, ...rest }: Attrs<"ul">) {
  return <ul {...rest} className={cx("dock", className as string)} />;
}

export type DockItemProps = Omit<Attrs<"li">, "children"> & {
  /** The app's name; the button reads "<name> (running)" or "(not running)". */
  name: string;
  /** Default true. */
  running?: boolean;
  buttonProps?: Attrs<"button">;
  /** The icon artwork (an <svg>). */
  children?: Node;
};

export function DockItem({ name, running = true, buttonProps, children, className, ...rest }: DockItemProps) {
  return (
    <li {...rest} className={cx(!running && "not-running", className as string) || undefined}>
      <button aria-label={`${name} (${running ? "running" : "not running"})`} {...buttonProps} className={cx("icon", buttonProps?.className as string)}>{children}</button>
    </li>
  );
}

export type RoundedWindowProps = Omit<Attrs<"div">, "title"> & { title: Node; onClose?: () => void };

export function RoundedWindow({ title, onClose, className, children, ...rest }: RoundedWindowProps) {
  return (
    <div {...rest} className={cx("rounded-window", className as string)}>
      <div className="rounded-title">
        <button className="close" aria-label="Close" onClick={onClose} />
        <h3>{title}</h3>
      </div>
      {children}
    </div>
  );
}

export type UtilityWindowProps = Omit<Attrs<"div">, "title"> & {
  title: Node;
  /** Title runs down the side. */
  side?: boolean;
  onClose?: () => void;
  onCollapse?: () => void;
  paneProps?: Attrs<"div">;
};

/** Utility (palette) window: close and collapse boxes, optional side title. */
export function UtilityWindow({ title, side, onClose, onCollapse, paneProps, className, children, ...rest }: UtilityWindowProps) {
  return (
    <div {...rest} className={cx("window", "utility", side && "side", className as string)}>
      <div className="title-bar">
        <button className="close" aria-label="Close" onClick={onClose} />
        <h3 className="title">{title}</h3>
        <button className="collapse" aria-label="Collapse" onClick={onCollapse} />
      </div>
      <div {...paneProps} className={cx("window-pane", paneProps?.className as string)}>{children}</div>
    </div>
  );
}

export function SplitView({ className, ...rest }: Attrs<"div">) {
  return <div {...rest} className={cx("split-view", className as string)} />;
}

/** The draggable split box at the scroll bar's end. */
export function SplitBar({ className, ...rest }: Omit<Attrs<"div">, "role">) {
  // biome-ignore lint/a11y/useSemanticElements: the ARIA role is part of clio.css's markup contract (clio.js and the stylesheet select on it)
  return <div aria-label="Split" {...rest} role="separator" className={cx("split-bar", className as string)} />;
}

/** The line between the panes. */
export function SplitLine({ className, ...rest }: Omit<Attrs<"div">, "role">) {
  // biome-ignore lint/a11y/useSemanticElements: the ARIA role is part of clio.css's markup contract (clio.js and the stylesheet select on it)
  return <div {...rest} role="separator" className={cx("split-line", className as string)} />;
}

export type TabsProps = Attrs<"div">;

/** Tab row: children are Tabs. Name it with aria-label. */
export function TabList({ className, ...rest }: Omit<TabsProps, "role">) {
  return <div {...rest} role="tablist" className={className} />;
}

export type TabProps = Omit<Attrs<"button">, "role"> & { selected?: boolean };

export function Tab({ selected, ...rest }: TabProps) {
  return <button {...rest} role="tab" aria-selected={!!selected} />;
}

export function TabPanel(props: Omit<TabsProps, "role">) {
  return <div {...props} role="tabpanel" />;
}
