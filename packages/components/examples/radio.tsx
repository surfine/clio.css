import { FieldRow, Fieldset, Radio } from "../src/index.ts";

export default () => (
  <Fieldset legend="Highlight">
    <FieldRow stacked>
      <Radio label="Lavender" name="hl" defaultChecked />
      <Radio label="Graphite" name="hl" />
      <Radio label="Other" name="hl" disabled />
    </FieldRow>
  </Fieldset>
);
