/* eslint-disable */

const { build, serve } = require('esbuild');
const { createServer, request } = require('http');
const { resolve } = require('path');
const serveConfigJSON = require('../../../serve-test.json');
const serveHandler = require('serve-handler');

const { PORT = 5001 } = process.env || {};

const resolveFromProjectRoot = resolve.bind(undefined, __dirname, '..');

// This is a plugin for resolving "react" from "isomorphic-react".
// With normal NPM package, we will resolving the actual "react" package.
// "isomorphic-react" exports React from environment (`window.React/ReactDOM`), if exists.
// Otherwise, it fallback to actual "react" package.
// This is to prevent having 2 versions of React running for the same component.
const isomorphicReactResolvePlugin = {
  name: 'isomorphic-react',
  setup(build) {
    build.onResolve({ filter: /^react$/u }, () => ({
      path: resolveFromProjectRoot('./node_modules/isomorphic-react/dist/react.js')
    }));

    build.onResolve({ filter: /^react-dom$/u }, () => ({
      path: resolveFromProjectRoot('./node_modules/isomorphic-react-dom/dist/react-dom.js')
    }));
  }
};

const BUILD_OPTIONS = {
  bundle: true,
  // Currently, we are only serving webchat-es5.js for development and testing purpose.
  // Saving some CPUs by not building other bundles.
  entryPoints: {
    'webchat-es5': resolveFromProjectRoot('./lib/index-es5.js')
  },
  logLevel: 'info',
  // Generate stats.json.
  metafile: true,
  // Minified file is smaller and load faster from GitHub Codespaces.
  minify: true,
  outdir: resolveFromProjectRoot('./dist'),
  plugins: [isomorphicReactResolvePlugin],
  sourcemap: true
};

(async function () {
  // We are both hosting the development server and writing to file output.
  // The file output is for Docker containers.
  const [, { host, port }] = await Promise.all([
    build({
      ...BUILD_OPTIONS,
      watch: true
    }),
    serve({}, BUILD_OPTIONS)
  ]);

  createServer((req, res) => {
    // Redirect all /__dist__/ to ESBuild development server.
    if (/^\/__dist__\//u.test(req.url)) {
      const path = req.url.replace(/^\/__dist__\//u, '/');
      const start = Date.now();

      return req.pipe(
        request(
          {
            hostname: host,
            port,
            path,
            method: req.method,
            headers: req.headers
          },
          proxyRes =>
            proxyRes
              .pipe(res, { end: true })
              .once('finish', () => console.log(`[serve] took ${Date.now() - start} ms for ${path}.`))
        ),
        { end: true }
      );
    }

    return serveHandler(req, res, {
      ...serveConfigJSON,
      public: resolveFromProjectRoot('./../../')
    });
  }).listen(PORT, () => console.log(`[serve] listening to port ${PORT}.`));
})();
