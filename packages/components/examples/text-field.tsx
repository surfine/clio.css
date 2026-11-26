import { FieldRow, TextArea, TextField } from "../src/index.ts";

export default () => (
  <FieldRow stacked style={{ width: "240px" }}>
    <TextField id="clio-name" label="Name:" defaultValue="Untitled" style={{ width: "100%" }} />
    <TextArea id="clio-notes" label="Notes:" rows={3} defaultValue="Text areas scroll with the era's scroll bar." style={{ width: "100%" }} />
  </FieldRow>
);
