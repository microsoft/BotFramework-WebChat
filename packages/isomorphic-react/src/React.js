/* global module */

// We intentionally use require() here.
// eslint-disable-next-line no-undef
const React = require('react');

module.exports = typeof window.React === 'undefined' ? React : window.React;
