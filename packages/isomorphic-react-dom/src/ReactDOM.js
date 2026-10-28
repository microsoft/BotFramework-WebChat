// The bundled React DOM is only evaluated when it is used: it cannot initialize with another React, such as React 19 in `window.React`.
module.exports = typeof window.ReactDOM === 'undefined' ? require('react-dom') : window.ReactDOM;
