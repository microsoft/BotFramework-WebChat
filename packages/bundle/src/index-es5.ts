/* eslint dot-notation: ["error", { "allowPattern": "^WebChat$" }] */
// window['WebChat'] is required for TypeScript

// Polyfills for IE11 and other ES5 browsers
// To maintain quality, we prefer polyfills without additives
// For example, we prefer Promise implementation from "core-js" than "bluebird"

import 'core-js/features/array/find-index';
import 'core-js/features/array/find';
import 'core-js/features/array/from';
import 'core-js/features/array/includes';
import 'core-js/features/array/iterator';
import 'core-js/features/dom-collections';
import 'core-js/features/math/sign';
import 'core-js/features/number/is-finite';
import 'core-js/features/object/assign';
import 'core-js/features/object/entries';
import 'core-js/features/object/from-entries';
import 'core-js/features/object/is';
import 'core-js/features/object/values';
import 'core-js/features/promise';
import 'core-js/features/promise/finally';
import 'core-js/features/set';
import 'core-js/features/string/ends-with';
import 'core-js/features/string/starts-with';
import 'core-js/features/symbol';

import 'url-search-params-polyfill';
import 'whatwg-fetch';
import { version } from './index-minimal';
import addVersion from './addVersion';
import defaultCreateDirectLine from './createDirectLine';
import defaultCreateDirectLineAppServiceExtension from './createDirectLineAppServiceExtension';

export * from './index';

export const createDirectLine = options => {
  options.botAgent &&
    console.warn(
      'Web Chat: Developers are not currently allowed to set botAgent in the createDirectLine function. See https://github.com/microsoft/BotFramework-WebChat/issues/2119 for more details.'
    );

  return defaultCreateDirectLine({ ...options, botAgent: `WebChat/${version} (ES5)` });
};

export const createDirectLineAppServiceExtension = options => {
  options.botAgent &&
    console.warn(
      'Web Chat: Developers are not currently allowed to set botAgent in the createDirectLine function. See https://github.com/microsoft/BotFramework-WebChat/issues/2119 for more details.'
    );

  return defaultCreateDirectLineAppServiceExtension({ ...options, botAgent: `WebChat/${version} (ES5)` });
};

window['WebChat'] = {
  ...window['WebChat'],
  createDirectLine,
  createDirectLineAppServiceExtension
};

addVersion('full-es5');
