/* eslint dot-notation: ["error", { "allowPattern": "^WebChat$" }] */
// window['WebChat'] is required for TypeScript

// Polyfills for IE11 and other ES5 browsers
// To maintain quality, we prefer polyfills without additives
// For example, we prefer Promise implementation from "core-js" than "bluebird"

import 'core-js/features/dom-collections';

import 'core-js/modules/es.array.find-index';
import 'core-js/modules/es.array.find';
import 'core-js/modules/es.array.includes';
import 'core-js/modules/es.array.iterator';
import 'core-js/modules/es.math.sign';
import 'core-js/modules/es.number.is-finite';
import 'core-js/modules/es.object.assign';
import 'core-js/modules/es.object.values';
import 'core-js/modules/es.promise';
import 'core-js/modules/es.promise.finally';
import 'core-js/modules/es.string.starts-with';
import 'core-js/modules/es.symbol';
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
