// Polyfills for IE11 and other ES5 browsers
// To maintain quality, we prefer polyfills without additives
// For example, we prefer Promise implementation from "core-js" than "bluebird"

// To reduce conflicts with hosting app, we should consider using
// @babel/plugin-transform-runtime to polyfill in transpiled code directly.

import 'core-js/features/array/find-index';
import 'core-js/features/array/find';
import 'core-js/features/array/from';
import 'core-js/features/array/includes';
import 'core-js/features/array/iterator';
import 'core-js/features/dom-collections';
import 'core-js/features/map';
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
