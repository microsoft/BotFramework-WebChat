import './polyfill/modern';

import buildInfo from '../../buildInfo';
import * as actual from '../actual/full';
import * as middleware from '../actual/middleware';

// Until we have a development-specific bundle, we are not shipping createStoreWithDevTools in bundle.
const { createStoreWithDevTools: _createStoreWithDevTools, ...exports } = actual;

window['WebChat'] = Object.freeze({
  ...window['WebChat'],
  ...exports,
  buildInfo: buildInfo.object,
  middleware
});
