import { FieldRow, Progress } from "../src/index.ts";

export default () => (
  <FieldRow stacked style={{ width: "260px" }}>
    <label htmlFor="clio-copy">Copying “System Folder”…</label>
    <Progress id="clio-copy" max={100} value={62}>62%</Progress>
  </FieldRow>
);
