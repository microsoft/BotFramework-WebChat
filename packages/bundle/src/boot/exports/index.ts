export * from '../actual/minimal';

// #region Overrides
export * from '../actual/full';
export {
  createStyleSet,
  ReactWebChat as default,
  ReactWebChat,
  renderWebChat,
  version,
  type StrictStyleOptions,
  type StyleOptions
} from '../actual/full';
// #endregion

// #region Backward compatibility
// Web devs should move to named exports instead.
export * as Components from '../actual/component/full';
export * as decorator from '../actual/decorator';
export * as hooks from '../actual/hook/full';
export * as internal from '../actual/internal';
// #endregion
