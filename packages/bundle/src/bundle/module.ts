import addVersion from './addVersion';
import * as minimal from '../module/exports-minimal';

const buildInfo = Object.freeze({
  ...minimal.buildInfo,
  buildTool: process.env.build_tool,
  moduleFormat: process.env.module_format
});

// Until we have a development-specific bundle, we are not shipping createStoreWithDevTools in bundle.
const { createStoreWithDevTools: _createStoreWithDevTools, ...finalMinimal } = minimal;

export * from '../module/exports-minimal';

export default Object.freeze({
  ...finalMinimal,
  buildInfo
});

export function defineMeta() {
  addVersion(buildInfo);
}
