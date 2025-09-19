import './polyfill/modern';

import * as actual from '../actual/full';
import './minimal';

// Until we have a development-specific bundle, we are not shipping createStoreWithDevTools in bundle.
const { createStoreWithDevTools: _createStoreWithDevTools, ...exports } = actual;

// Built on top of ./minimal.
// ./minimal export /decorator, /internal, /middleware, so we don't need to duplicate that behavior here.
window['WebChat'] = Object.freeze({
  ...window['WebChat'],
  ...exports
});
