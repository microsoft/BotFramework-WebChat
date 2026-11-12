const React = require('react');

// The bundled React DOM 16 renders with `window.React` when `window.ReactDOM` is not set: React's useSyncExternalStore()
// would need React DOM 18 or later. Hide it, so the ponyfill falls back to its React 16/17 version.
// Remove when the bundled React DOM is 18 or later.
module.exports =
  typeof window.React === 'undefined'
    ? React
    : typeof window.ReactDOM === 'undefined'
      ? { ...window.React, useSyncExternalStore: undefined }
      : window.React;
