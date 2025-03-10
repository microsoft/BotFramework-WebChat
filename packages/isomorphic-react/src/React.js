const React = require('react');

module.exports = typeof window.React === 'undefined' ? React : window.React;
