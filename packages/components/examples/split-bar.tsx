import { SplitBar, SplitLine, SplitView } from "../src/index.ts";

export default () => (
  <SplitView style={{ width: "220px", height: "120px" }}>
    <SplitBar />
    <div style={{ flex: "1", padding: "0 8px" }}>Opening paragraphs…</div>
    <SplitLine />
    <div style={{ flex: "1", padding: "4px 8px" }}>…and the conclusion.</div>
  </SplitView>
);
