import buildInfo from '../buildInfo';
import * as actual from '../full';
import * as middleware from '../middleware';
// import './polyfill/modern';

declare global {
  interface Window {
    WebChat: any;
  }
}

buildInfo.set('variant', 'full');

// Until we have a development-specific bundle, we are not shipping createStoreWithDevTools in bundle.
const { createStoreWithDevTools: _createStoreWithDevTools, ...exports } = actual;

window['WebChat'] = Object.freeze({
  ...window['WebChat'],
  ...exports,
  buildInfo: buildInfo.object,
  middleware
});
