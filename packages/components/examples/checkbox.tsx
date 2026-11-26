import { Checkbox, FieldRow } from "../src/index.ts";

export default () => (
  <FieldRow stacked>
    <Checkbox label="Show warnings" defaultChecked />
    <Checkbox label="Use small icons" />
    <Checkbox label="Locked" defaultChecked disabled />
  </FieldRow>
);
