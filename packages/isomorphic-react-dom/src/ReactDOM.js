const ReactDOM = require('react-dom');

module.exports = typeof window.ReactDOM === 'undefined' ? ReactDOM : window.ReactDOM;
