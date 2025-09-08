import buildInfo from '../../buildInfo';
import * as middleware from '../actual/middleware';
import * as actual from '../actual/minimal.js';

// Until we have a development-specific bundle, we are not shipping createStoreWithDevTools in bundle.
const { createStoreWithDevTools: _createStoreWithDevTools, ...exports } = actual;

window['WebChat'] = Object.freeze({
  ...window['WebChat'],
  ...exports,
  buildInfo: buildInfo.object,
  middleware
});
