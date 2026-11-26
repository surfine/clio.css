import { FieldRow, Select } from "../src/index.ts";

export default () => (
  <FieldRow>
    <Select id="clio-font" label="Font:">
      <option>Chicago</option>
      <option selected>Geneva</option>
      <option>New York</option>
    </Select>
  </FieldRow>
);
