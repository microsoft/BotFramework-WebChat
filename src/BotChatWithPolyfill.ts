export * from './BotChat';

// below are shims for compatibility with old browsers (IE 10 being the main culprit)
import 'core-js/modules/es6.array.find';
import 'core-js/modules/es6.array.find-index';
import 'core-js/modules/es6.string.starts-with';

import * as BluebirdPromise from 'bluebird';

// Polyfill Promise if needed
if (typeof (window as any).Promise === 'undefined') {
  // tslint:disable-next-line:no-var-requires
  (window as any).Promise = BluebirdPromise;
}
