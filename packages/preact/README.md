# clio.css-preact

clio.css's 32 components (windows, menus, controls, dialogs, the NeXTSTEP dock…) as Preact
components. Each renders exactly the markup documented at https://surfine.github.io/clio.css/,
so the look comes from [clio.css](https://www.npmjs.com/package/clio.css) itself and the
behaviour (menu tracking, scroll bars, dragged outlines) from its optional clio.js. The
components are controlled: props in, events out, no state or behaviour of their own.

```bash
npm install clio.css clio.css-preact preact
```

```tsx
import "clio.css";                          // with a bundler; or link dist/clio.css
import { install } from "clio.css/js.esm"; // optional: clio.js's behaviour
import { Window, Button, FieldRow } from "clio.css-preact";

install();

export const App = () => (
  <div data-era="platinum">
    <Window title="Macintosh HD" style={{ width: "300px" }}>
      <FieldRow>
        <Button>Cancel</Button>
        <Button default>OK</Button>
      </FieldRow>
    </Window>
  </div>
);
```

Set the era with `data-era` on any ancestor: `system6` (default), `system7`, `drawingboard`,
`platinum`. NeXTSTEP needs `clio.css/nextstep` instead of the default stylesheet; `Browser`,
`PullDown`, `Dock` and `DockItem` are drawn only there.

## Components

`AlertBox`, `Balloon`, `BevelButton`, `Browser`, `Button`, `ChasingArrows`, `Checkbox`, `ClioScope`, `ControlStrip`, `ControlStripModule`, `Desktop`, `DesktopIcon`, `Disclosure`, `Dock`, `DockItem`, `FieldRow`, `Fieldset`, `HelpButton`, `ImageWell`, `ListView`, `ListViewCell`, `ListViewHeader`, `Listbox`, `ListboxOption`, `LittleArrows`, `MenuBar`, `MenuBarItem`, `MenuItem`, `MenuSeparator`, `Placard`, `Progress`, `PullDown`, `Radio`, `RoundedWindow`, `ScrollArea`, `Select`, `Slider`, `SortDirectionHeader`, `SplitBar`, `SplitLine`, `SplitView`, `StandardDialog`, `Tab`, `TabList`, `TabPanel`, `Text`, `TextArea`, `TextField`, `UtilityWindow`, `Window`.

Props are typed (`dist/types`); each component's markup, tokens and evidence are on the docs
site under the same name, and `clio.css/components.json` lists them for tools.

## Versions

- Same version number as clio.css; the peer range is `clio.css >= 2.0.0` and preact >= 11.
- The DOM each component renders is part of clio.css's markup: it changes only with
  clio.css's, and both are checked to match `components.json` in `npm test` and, from the
  packed tarballs, in `npm run verify`.
- Whether the component props are part of the long-term promise is an open decision
  (see [dev/RELEASE-2.0.1.md](https://github.com/surfine/clio.css/blob/main/dev/RELEASE-2.0.1.md)).

## Source

Written once in JSX in [`packages/components`](https://github.com/surfine/clio.css/tree/main/packages/components),
which builds this package and its React twin (`clio.css-react`). Built with heavy AI
assistance; the markup check and clio.css's [EVIDENCE.md](https://github.com/surfine/clio.css/blob/main/EVIDENCE.md)
are how to verify it.

MIT, see [LICENSE](LICENSE). Not affiliated with or endorsed by Apple Inc. or NeXT.
