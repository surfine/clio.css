import { LittleArrows, TextField } from "../src/index.ts";

export default () => (
  <>
    <TextField defaultValue="32K" aria-label="Cache size" style={{ width: "60px" }} />{" "}
    <LittleArrows aria-label="Cache size" />
  </>
);
