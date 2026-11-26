import { Checkbox, FieldRow, Fieldset } from "../src/index.ts";

export default () => (
  <Fieldset legend="Sound" style={{ width: "260px" }}>
    <FieldRow>
      <Checkbox label="Play system alerts" defaultChecked />
    </FieldRow>
  </Fieldset>
);
