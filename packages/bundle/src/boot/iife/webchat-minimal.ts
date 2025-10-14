import * as internal from '../exports/internal';
import * as actual from '../exports/minimal';
import * as middleware from '../exports/middleware';

// Until we have a development-specific bundle, we are not shipping createStoreWithDevTools in bundle.
const { createStoreWithDevTools: _createStoreWithDevTools, ...exports } = actual;

window['WebChat'] = Object.freeze({
  ...window['WebChat'], // Should be undefined, but just in case.
  ...exports,
  internal,
  middleware
});
