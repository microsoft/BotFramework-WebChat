export * from '../actual/minimalSet';

// #region Overrides
export * from '../actual/fullSet';
export { createStyleSet, version, type StrictStyleOptions, type StyleOptions } from '../actual/fullSet';
// #endregion

// #region Backward compatibility
// Web devs should move to named exports instead.
export * as decorator from '../actual/decorator';
export * as internal from '../actual/internal';
export * as Components from '../actual/component/fullSet';
export * as hooks from '../actual/hook/fullSet';
// #endregion
