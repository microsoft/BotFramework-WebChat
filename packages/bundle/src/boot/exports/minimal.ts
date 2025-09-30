export * from '../actual/minimal';
export { ReactWebChat as default } from '../actual/minimal'; // export * does not export default.

// #region Backward compatibility
// Web devs should move to named exports instead.
export * as Components from '../actual/component/minimal';
export * as decorator from '../actual/decorator';
export * as hooks from '../actual/hook/minimal';
export * as internal from '../actual/internal';
// #endregion
