
// below are shims for compatibility with old browsers (IE 10 being the main culprit)
import 'core-js/modules/es6.array.find-index';
import 'core-js/modules/es6.array.find';
import 'core-js/modules/es6.array.iterator';
import 'core-js/modules/es6.object.assign';
import 'core-js/modules/es6.math.sign';
import 'core-js/modules/es6.promise';
import 'core-js/modules/es6.string.starts-with';
import 'core-js/modules/es6.symbol';
import 'core-js/modules/es7.array.includes';
import 'whatwg-fetch';

// URLSearchParams

console.log('Bundled with ES5 polyfills');

export * from './index';
