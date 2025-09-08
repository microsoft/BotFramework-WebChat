export { default as DebugProvider, debugProviderPropsSchema, type DebugProviderProps } from './DebugProvider';

// #region Build info
import buildInfo from './buildInfo';

const { readonlyObject, version } = buildInfo;

export { readonlyObject as buildInfo, version };
// #endregion
