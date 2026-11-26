import { Desktop, DesktopIcon } from "../src/index.ts";

export default () => (
  <Desktop style={{ minHeight: "0", padding: "16px", display: "flex", gap: "12px" }}>
    <DesktopIcon label="Macintosh HD">
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <rect x="4" y="6" width="24" height="20" fill="#fff" stroke="#000" />
        <rect x="7" y="9" width="18" height="11" fill="#000" />
      </svg>
    </DesktopIcon>
    <DesktopIcon label="Documents" selected>
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M5 9h9l2 2h11v15H5z" fill="#fff" stroke="#000" />
      </svg>
    </DesktopIcon>
  </Desktop>
);
