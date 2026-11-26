import { BevelButton } from "../src/index.ts";

export default () => (
  <>
    <BevelButton menu aria-label="Shortcuts" style={{ width: "36px", height: "27px" }}>☞</BevelButton>{" "}
    <BevelButton pressed style={{ width: "36px", height: "27px" }}>B</BevelButton>
  </>
);
