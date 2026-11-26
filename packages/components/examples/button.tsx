import { Button, FieldRow } from "../src/index.ts";

export default () => (
  <FieldRow style={{ gap: "16px" }}>
    <Button>Cancel</Button>
    <Button default>OK</Button>
    <Button pressed>Pressed</Button>
    <Button disabled>Eject</Button>
  </FieldRow>
);
