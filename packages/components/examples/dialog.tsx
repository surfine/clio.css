import { AlertBox, Button, StandardDialog } from "../src/index.ts";

export default () => (
  <AlertBox icon="caution" messageId="clio-alert-msg" message="Save changes to the document “Untitled” before closing?" style={{ width: "340px" }}>
    <Button>Don’t Save</Button>
    <Button>Cancel</Button>
    <Button default>Save</Button>
  </AlertBox>
);

export const variants = {
  "Plain box": () => (
    <StandardDialog style={{ width: "280px" }}>
      <p style={{ margin: "0" }}>Welcome to Macintosh.</p>
    </StandardDialog>
  ),
};
