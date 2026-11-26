import { Listbox, ListboxOption } from "../src/index.ts";

export default () => (
  <Listbox aria-label="Documents" style={{ width: "220px", height: "82px" }}>
    <ListboxOption selected>Apple DVD Player</ListboxOption>
    <ListboxOption>Apple Video Player</ListboxOption>
    <ListboxOption>AppleCD Audio Player</ListboxOption>
    <ListboxOption>QuickTime</ListboxOption>
    <ListboxOption>Security</ListboxOption>
    <ListboxOption>SimpleText</ListboxOption>
  </Listbox>
);
