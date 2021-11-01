/* global module */

// We intentionally use require() here.
// eslint-disable-next-line no-undef
const ReactDOM = require('react-dom');

module.exports = typeof window.ReactDOM === 'undefined' ? ReactDOM : window.ReactDOM;
