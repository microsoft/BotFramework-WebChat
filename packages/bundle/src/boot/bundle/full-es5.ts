// Importing polyfills required for IE11/ES5.
import './polyfill/es5';

import * as actual from '../actual/full-es5';
import * as middleware from '../actual/middleware';
import buildInfo from '../buildInfo';

// Until we have a development-specific bundle, we are not shipping createStoreWithDevTools in bundle.
const { createStoreWithDevTools: _createStoreWithDevTools, ...exports } = actual;

window['WebChat'] = Object.freeze({
  ...window['WebChat'],
  ...exports,
  buildInfo: buildInfo.readonlyObject,
  middleware
});
