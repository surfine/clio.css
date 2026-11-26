// Alert box (icon, message, button row) and the plain standard dialog box.
import type { Attrs, Node } from "clio-jsx";
import { cx } from "./cx.ts";

export type AlertBoxProps = Omit<Attrs<"div">, "role"> & {
  icon?: "caution" | "note" | "stop";
  /** The message; labels the dialog (aria-labelledby points at it). */
  message: Node;
  messageId: string;
  /** The buttons, drawn in the dialog-buttons row (mark the default one with <Button default>). */
  children?: Node;
};

export function AlertBox({ icon, message, messageId, children, className, ...rest }: AlertBoxProps) {
  return (
    <div aria-labelledby={messageId} {...rest} className={cx("alert-box", className as string)} role="alertdialog">
      {icon && <span className={cx("alert-icon", icon)} aria-hidden="true" />}
      <p id={messageId}>{message}</p>
      <div className="dialog-buttons">{children}</div>
    </div>
  );
}

export function StandardDialog({ className, ...rest }: Attrs<"div">) {
  return <div {...rest} className={cx("standard-dialog", className as string)} />;
}
