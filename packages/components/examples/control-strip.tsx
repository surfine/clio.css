import { ControlStrip, ControlStripModule } from "../src/index.ts";

const icon = (fill: string) => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <rect x="2" y="3" width="12" height="9" fill="none" stroke="currentColor" />
    <rect x="4" y="5" width="8" height="5" fill={fill} />
    <rect x="6" y="12" width="4" height="2" fill="currentColor" />
  </svg>
);

export default () => (
  <ControlStrip scrollBackDisabled scrollForwardDisabled>
    <ControlStripModule aria-label="Monitor bit depth">{icon("#ff0000")}</ControlStripModule>
    <ControlStripModule aria-label="Sound volume">{icon("currentColor")}</ControlStripModule>
    <ControlStripModule aria-label="File sharing">{icon("#3366cc")}</ControlStripModule>
  </ControlStrip>
);

export const variants = {
  Folded: () => <ControlStrip collapsed />,
};
