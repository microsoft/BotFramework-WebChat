import * as middleware from '../actual/middleware';
import * as minimal from '../actual/minimal.js';
import addVersion from '../addVersion';

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
  buildInfo,
  middleware
});

addVersion(buildInfo);
