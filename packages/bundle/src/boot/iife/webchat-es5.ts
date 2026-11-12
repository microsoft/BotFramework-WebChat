// Polyfills for some newer built-ins only: like "webchat.js", this bundle is ES2019 and does not run on IE11/ES5.
import './polyfill/es5';

import buildInfo from '../../buildInfo';

buildInfo.set('variant', 'full-es5');

// "./full" is IIFE, just importing it will inject to globalThis.
import './webchat';
