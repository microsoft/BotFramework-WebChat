// Importing polyfills required for IE11/ES5.
import './polyfill';

import addVersion from '../addVersion';
import * as es5 from '../actual/full-es5';

const buildInfo = Object.freeze({
  ...es5.buildInfo,
  buildTool: process.env.build_tool,
  moduleFormat: process.env.module_format
});

// Until we have a development-specific bundle, we are not shipping createStoreWithDevTools in bundle.
const { createStoreWithDevTools: _createStoreWithDevTools, ...finalES5 } = es5;

window['WebChat'] = Object.freeze({
  ...window['WebChat'],
  ...finalES5,
  buildInfo
});

addVersion(buildInfo);
