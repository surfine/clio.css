# clio.css for Preact

clio.css's 32 components (windows, menus, controls, dialogs, the NeXTSTEP dock…) as Preact
components. Each renders exactly the markup documented at https://surfine.github.io/clio.css/,
so the look comes from clio.css itself and the behaviour (menu tracking, scroll bars, dragged
outlines) from clio.js. The components are controlled: props in, events out.

```bash
npm install clio.css preact clio.css-preact
```

```tsx
import "clio.css/dist/clio.css";
import { install } from "clio.css/js.esm";
import { Window, Button, FieldRow } from "clio.css-preact";

install();   // optional: clio.js's behaviour

export const App = () => (
  <Window title="Macintosh HD" style={{ width: "300px" }}>
    <FieldRow>
      <Button>Cancel</Button>
      <Button default>OK</Button>
    </FieldRow>
  </Window>
);
```

Set the era with `data-era` on any ancestor (`system6` by default, `system7`, `drawingboard`,
`platinum`; NeXTSTEP needs `clio.css/nextstep` instead of the default stylesheet).

The same JSX source builds this package and its React twin; both are checked to render the same DOM.
MIT.
