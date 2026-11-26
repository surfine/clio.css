// components.json's window example and variants, built from the components (test/components.test.ts
// checks the rendered DOM against that markup in both frameworks).
import { Window } from "../src/index.ts";

export default () => (
  <Window title="Macintosh HD" style={{ width: "300px" }} details={["12 items", "232K in disk", "167K available"]} paneProps={{ style: { height: "96px" } }}>
    <p>A window pane scrolls with the era's scroll bars.</p>
  </Window>
);

export const variants = {
  "Inactive window": () => <Window title="Untitled" inactive style={{ width: "300px" }} paneProps={{ style: { height: "48px" } }} />,
  "With a WindowShade box": () => <Window title="Appearance" shade style={{ width: "300px" }} paneProps={{ style: { height: "48px" } }} />,
};
