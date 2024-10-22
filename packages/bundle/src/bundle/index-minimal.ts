import addVersion from './addVersion';
import * as minimal from '../module/exports-minimal.js';

const buildInfo = Object.freeze({
  ...minimal.buildInfo,
  moduleFormat: 'iife'
});

// Until we have a development-specific bundle, we are not shipping createStoreWithDevTools in bundle.
const { createStoreWithDevTools: _createStoreWithDevTools, ...finalMinimal } = minimal;

window['WebChat'] = Object.freeze({
  ...window['WebChat'],
  ...finalMinimal,
  buildInfo
});

addVersion(buildInfo);
