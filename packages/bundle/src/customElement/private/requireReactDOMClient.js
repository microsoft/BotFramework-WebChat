/* eslint-env commonjs */

// "react-dom/client" (React 18 and later), or `undefined` on React 16 and 17, which do not have it.
// Hand-written CommonJS, copied as-is into dist/ by tsup.config.ts: bundlers (esbuild, Vite, webpack 5) build a
// `require()` in `try` on React 16 and 17 too, where it throws at run time, but fail on an `import()` they cannot resolve.
// esbuild.static.mjs replaces this file with importReactDOMClient.mjs, which import maps resolve.
let reactDOMClient;

try {
  reactDOMClient = require('react-dom/client');
} catch {
  reactDOMClient = undefined;
}

module.exports = reactDOMClient;
