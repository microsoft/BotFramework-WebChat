// Importing polyfills required for IE11/ES5.
import './polyfill/es5';

import buildInfo from '../../buildInfo';

buildInfo.set('variant', 'full-es5');

// "./full" is IIFE, just importing it will inject to globalThis.
import './webchat';
