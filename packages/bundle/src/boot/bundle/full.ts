import './polyfill/modern';

import * as actual from '../actual/full';
import * as middleware from '../actual/middleware';
import addVersion from '../addVersion';

const buildInfo = Object.freeze({ ...actual.buildInfo, moduleFormat: process.env.module_format });

// Until we have a development-specific bundle, we are not shipping createStoreWithDevTools in bundle.
const { createStoreWithDevTools: _createStoreWithDevTools, ...exports } = actual;

window['WebChat'] = Object.freeze({
  ...window['WebChat'],
  ...exports,
  buildInfo,
  middleware
});

addVersion(buildInfo);
