import { ClioScope, Text } from "../src/index.ts";

export default () => (
  <ClioScope style={{ padding: "12px", background: "var(--clio-pane-bg)" }}>
    <Text as="h2" variant="heading">Clio Sans '84 is the system font</Text>
    <Text variant="text">Clio Text '84 (Geneva) is the application font. Every value is a --clio-* custom property you can override on any element.</Text>
    <Text variant="display" style={{ fontSize: "28px", lineHeight: "34px", margin: "0" }}>Display: any other size</Text>
    <Text variant="text" lang="zh-Hant">繁體中文、<span lang="ja">日本語</span>、<span lang="ko">한국어</span>：lang 屬性換上像素字型</Text>
  </ClioScope>
);
