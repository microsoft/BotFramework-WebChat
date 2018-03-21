export * from './BotChat';

// below are shims for compatibility with old browsers (IE 10 being the main culprit)
import 'core-js/modules/es6.string.starts-with';
import 'core-js/modules/es6.array.find';
import 'core-js/modules/es6.array.find-index';

// Polyfill Promise if needed
if (typeof (window as any).Promise === 'undefined') {
  (window as any).Promise = require('bluebird');
}
