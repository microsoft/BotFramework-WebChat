export * from '../actual/minimalSet';

// #region Backward compatibility
// Web devs should move to named exports instead.
export * as decorator from '../actual/decorator';
export * as internal from '../actual/internal';
export * as Components from '../actual/component/minimalSet';
export * as hooks from '../actual/hook/minimalSet';
// #endregion
