import './modern-polyfill';

import addVersion from '../addVersion';
import * as full from '../actual/full';

const buildInfo = Object.freeze({
  ...full.buildInfo,
  buildTool: process.env.build_tool,
  moduleFormat: process.env.module_format
});

// Until we have a development-specific bundle, we are not shipping createStoreWithDevTools in bundle.
const { createStoreWithDevTools: _createStoreWithDevTools, ...finalFull } = full;

window['WebChat'] = Object.freeze({
  ...window['WebChat'],
  ...finalFull,
  buildInfo
});

addVersion(buildInfo);
