/* eslint dot-notation: ["error", { "allowPattern": "^WebChat$" }] */
// window['WebChat'] is required for TypeScript

// Polyfills for IE11 and other ES5 browsers
// To maintain quality, we prefer polyfills without additives
// For example, we prefer Promise implementation from "core-js" than "bluebird"

import 'core-js/modules/es6.array.find-index';
import 'core-js/modules/es6.array.find';
import 'core-js/modules/es6.array.iterator';
import 'core-js/modules/es6.object.assign';
import 'core-js/modules/es6.math.sign';
import 'core-js/modules/es6.number.is-finite';
import 'core-js/modules/es6.promise';
import 'core-js/modules/es6.string.starts-with';
import 'core-js/modules/es6.symbol';
import 'core-js/modules/es7.array.includes';
import 'url-search-params-polyfill';
import 'whatwg-fetch';
import { version } from './index-minimal';
import addVersion from './addVersion';
import defaultCreateDirectLine from './createDirectLine';

export * from './index';

export const createDirectLine = options => {
  options.botAgent &&
    console.warn(
      'Web Chat: Developers are not currently allowed to set botAgent in the createDirectLine function. See https://github.com/microsoft/BotFramework-WebChat/issues/2119 for more details.'
    );
  return defaultCreateDirectLine({ ...options, botAgent: `WebChat/${version} (ES5)` });
};

window['WebChat'] = {
  ...window['WebChat'],
  createDirectLine
};

addVersion('full-es5');
