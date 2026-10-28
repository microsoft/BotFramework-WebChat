/// <reference types="node" />

// The React DOM of the page, as with "react": a bundled React DOM cannot initialize with another React, such as React 19.
module.exports = (globalThis as any).ReactDOM;
