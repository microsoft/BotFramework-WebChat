import './polyfill/modern';

import buildInfo from '../../buildInfo';
import * as full from '../exports/full';
import * as internal from '../exports/internal';
import * as middleware from '../exports/middleware';

// Until we have a development-specific bundle, we are not shipping createStoreWithDevTools in bundle.
const { createStoreWithDevTools: _createStoreWithDevTools, ...exports } = full;

window['WebChat'] = Object.freeze({
  ...window['WebChat'],
  ...exports,
  buildInfo: buildInfo.object,
  internal,
  middleware
});
