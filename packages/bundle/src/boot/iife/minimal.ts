import buildInfo from '../../buildInfo';
import * as middleware from '../exports/middleware';
import * as minimal from '../exports/minimal.js';

// Until we have a development-specific bundle, we are not shipping createStoreWithDevTools in bundle.
const { createStoreWithDevTools: _createStoreWithDevTools, ...exports } = minimal;

window['WebChat'] = Object.freeze({
  ...window['WebChat'],
  ...exports,
  buildInfo: buildInfo.object,
  middleware
});
