import { FieldRow, Select, Tab, TabList, TabPanel } from "../src/index.ts";

export default () => (
  <div style={{ width: "320px" }}>
    <TabList aria-label="Appearance">
      <Tab selected>Appearance</Tab>
      <Tab>Fonts</Tab>
      <Tab>Sound</Tab>
    </TabList>
    <TabPanel>
      <FieldRow>
        <Select id="clio-theme" label="Theme:">
          <option>Mac OS Default</option>
        </Select>
      </FieldRow>
    </TabPanel>
  </div>
);
