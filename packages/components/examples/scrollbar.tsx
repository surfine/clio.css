import { ScrollArea } from "../src/index.ts";

export default () => (
  <ScrollArea style={{ width: "220px", height: "96px", overflow: "scroll", border: "1px solid", background: "var(--clio-pane-bg)", fontFamily: "var(--clio-font-text)" }}>
    <p style={{ width: "360px", margin: "8px" }}>The lane, the scroll box and both arrow boxes come from the era. Firefox has no scroll-bar parts, so it gets the era's colours only.</p>
    <p style={{ margin: "8px" }}>Scroll me.</p>
  </ScrollArea>
);
