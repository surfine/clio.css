import { Browser, Listbox, ListboxOption } from "../src/index.ts";

export default () => (
  <Browser style={{ width: "302px" }}>
    <Listbox aria-label="Disk" style={{ height: "96px" }}>
      <ListboxOption branch selected>Apps</ListboxOption>
      <ListboxOption branch>Library</ListboxOption>
      <ListboxOption>Welcome!</ListboxOption>
    </Listbox>
    <Listbox aria-label="Apps" style={{ height: "96px" }}>
      <ListboxOption>Edit.app</ListboxOption>
      <ListboxOption>Mail.app</ListboxOption>
    </Listbox>
  </Browser>
);
