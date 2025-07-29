import addVersion from '../addVersion';
import * as minimal from '../actual/minimal.js';

const buildInfo = Object.freeze({
  ...minimal.buildInfo,
  buildTool: process.env.build_tool,
  moduleFormat: process.env.module_format
});

// Until we have a development-specific bundle, we are not shipping createStoreWithDevTools in bundle.
const { createStoreWithDevTools: _createStoreWithDevTools, ...finalMinimal } = minimal;

window['WebChat'] = Object.freeze({
  ...window['WebChat'],
  ...finalMinimal,
  buildInfo
});

addVersion(buildInfo);
