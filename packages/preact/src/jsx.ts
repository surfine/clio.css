// The framework seam for clio.css-preact: packages/components imports "clio-jsx", which the
// Preact build, tsconfig and Vitest project resolve to this file.
import type { ComponentChildren, JSX } from "preact";
export { useEffect, useLayoutEffect, useRef } from "preact/hooks";
export type Node = ComponentChildren;
/** A native element's attributes, as this framework types them. */
export type Attrs<T extends keyof JSX.IntrinsicElements> = JSX.IntrinsicElements[T];
