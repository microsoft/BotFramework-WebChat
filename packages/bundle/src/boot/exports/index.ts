export * from './minimal';

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

// #region Overrides for backward compatibility
// Web devs should move to named exports instead.
export * as Components from '../actual/component/full';
export * as hooks from '../actual/hook/full';
// #endregion
