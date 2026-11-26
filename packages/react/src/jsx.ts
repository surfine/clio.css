// The framework seam for @clio/react: packages/components imports "clio-jsx", which the
// React build, tsconfig and Vitest project resolve to this file.
import type { JSX, ReactNode } from "react";
export { useEffect, useLayoutEffect, useRef } from "react";
export type Node = ReactNode;
/** A native element's attributes, as this framework types them. */
export type Attrs<T extends keyof JSX.IntrinsicElements> = JSX.IntrinsicElements[T];
