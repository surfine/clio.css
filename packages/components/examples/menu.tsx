import { MenuBar, MenuBarItem, MenuItem, MenuSeparator } from "../src/index.ts";

export default () => (
  <MenuBar aria-label="Menu bar">
    <MenuBarItem label="File" open>
      <MenuItem shortcut="⌘N">New Folder</MenuItem>
      <MenuItem shortcut="⌘O">Open</MenuItem>
      <MenuItem disabled>Print</MenuItem>
      <MenuItem shortcut="⌘W">Close</MenuItem>
      <MenuSeparator />
      <MenuItem checked>Show Clipboard</MenuItem>
    </MenuBarItem>
    <MenuBarItem label="Edit" />
    <MenuBarItem label="View" />
    <MenuBarItem label="Special" />
  </MenuBar>
);
