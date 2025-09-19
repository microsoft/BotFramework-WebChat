import * as actual from '../exports/minimal';

// Until we have a development-specific bundle, we are not shipping createStoreWithDevTools in bundle.
const { createStoreWithDevTools: _createStoreWithDevTools, ...exports } = actual;

window['WebChat'] = Object.freeze({
  ...window['WebChat'], // Should be undefined, but just in case.
  ...exports
});
