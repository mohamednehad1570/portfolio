/**
 * Type declaration for the vendored GlareHover.jsx (plain JavaScript from React Bits).
 * Why: TypeScript would infer every optional prop of a .jsx component as required; this keeps the props
 * open (documented in the .jsx file) so TypeScript pages can use the component.
 */
import type { ComponentType } from "react";

declare const GlareHover: ComponentType<Record<string, unknown>>;
export default GlareHover;
