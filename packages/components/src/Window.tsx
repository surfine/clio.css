// Document window: frame, title bar (close, title, zoom, optional WindowShade box), an optional
// details bar and the scrolling pane. Boxes are buttons with the labels clio.js and screen
// readers use; onClose/onZoom/onShade are their clicks. The title is a heading (h3 unless titleAs).
import type { Attrs, Node } from "clio-jsx";
import { cx } from "./cx.ts";

export type WindowProps = Omit<Attrs<"div">, "title"> & {
  title: Node;
  titleAs?: "h1" | "h2" | "h3" | "h4";
  inactive?: boolean;
  /** Draw the WindowShade (collapse) box. */
  shade?: boolean;
  /** The details bar's cells (item count, disk use). */
  details?: Node[];
  paneProps?: Attrs<"div">;
  onClose?: () => void;
  onZoom?: () => void;
  onShade?: () => void;
};

export function Window({ title, titleAs: Title = "h3", inactive, shade, details, paneProps, onClose, onZoom, onShade, className, children, ...rest }: WindowProps) {
  return (
    <div {...rest} className={cx("window", inactive && "inactive", className as string)}>
      <div className="title-bar">
        <button className="close" aria-label="Close" onClick={onClose} />
        <Title className="title">{title}</Title>
        <button className="resize" aria-label="Zoom" onClick={onZoom} />
        {shade && <button className="shade" aria-label="Collapse" onClick={onShade} />}
      </div>
      {details && (
        <div className="details-bar">
          {details.map((d, i) => <span key={i}>{d}</span>)}
        </div>
      )}
      <div {...paneProps} className={cx("window-pane", paneProps?.className as string)}>{children}</div>
    </div>
  );
}
