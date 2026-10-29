export * from '../actual/minimal';
export { ReactWebChat as default } from '../actual/minimal'; // export * does not export default.

// #region Backward compatibility
// Web devs should move to named exports instead.
// Keep types out of these namespaces until rollup-plugin-dts (used by tsup) emits types imported from another package as types:
// it emits them as `declare const X: typeof X`, which fails type checking (TS2693). Entry points export them instead, e.g. `./decorator.ts`.
export * as Components from '../actual/component/minimal';
export * as decorator from '../actual/decorator';
export * as hooks from '../actual/hook/minimal';
export * as internal from '../actual/internal';
// #endregion
