export { default as DebugProvider, debugProviderPropsSchema, type DebugProviderProps } from './DebugProvider';

// #region Build info
import buildInfo from './buildInfo';

const { object: buildInfoObject, version } = buildInfo;

export { buildInfoObject as buildInfo, version };
// #endregion
