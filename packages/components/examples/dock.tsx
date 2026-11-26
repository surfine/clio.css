import { Dock, DockItem } from "../src/index.ts";

export default () => (
  <Dock aria-label="Dock">
    <DockItem name="Workspace" buttonProps={{ style: { width: "64px" } }}>
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <rect x="8" y="8" width="32" height="32" fill="#000" />
      </svg>
    </DockItem>
    <DockItem name="Edit" running={false} buttonProps={{ style: { width: "64px" } }}>
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <rect x="12" y="8" width="24" height="32" fill="#fff" stroke="#000" />
      </svg>
    </DockItem>
  </Dock>
);
