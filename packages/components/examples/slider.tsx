import { Slider } from "../src/index.ts";

export default () => (
  <>
    <label htmlFor="clio-rate">Key Repeat Rate</label>{" "}
    <Slider id="clio-rate" min={0} max={4} defaultValue={2} ticks={5} style={{ width: "120px" }} />
  </>
);
