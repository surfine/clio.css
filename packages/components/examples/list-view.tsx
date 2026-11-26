import { Disclosure, ListView, ListViewCell, ListViewHeader, SortDirectionHeader } from "../src/index.ts";

export default () => (
  <ListView style={{ width: "340px" }}>
    <thead>
      <tr>
        <ListViewHeader sort="ascending">Name</ListViewHeader>
        <ListViewHeader>Date Modified</ListViewHeader>
        <SortDirectionHeader />
      </tr>
    </thead>
    <tbody>
      <tr>
        <ListViewCell sorted><Disclosure aria-label="Show" /> Developer</ListViewCell>
        <ListViewCell colSpan={2}>Thu, Apr 14, 2022</ListViewCell>
      </tr>
      <tr>
        <ListViewCell sorted><Disclosure aria-label="Show" /> Games</ListViewCell>
        <ListViewCell colSpan={2}>Thu, Apr 14, 2022</ListViewCell>
      </tr>
    </tbody>
  </ListView>
);
