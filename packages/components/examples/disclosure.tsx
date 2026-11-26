import { Disclosure } from "../src/index.ts";

export default () => (
  <>
    <details open>
      <summary>Control Panels &amp; Extensions</summary>
      <p style={{ margin: "4px 0 0 17px" }}>Appearance</p>
    </details>
    <Disclosure aria-label="Show Developer" /> Developer
  </>
);
