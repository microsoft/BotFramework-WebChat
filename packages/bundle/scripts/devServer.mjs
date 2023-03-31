import { context } from 'esbuild';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const resolveFromProjectRoot = resolve.bind(undefined, fileURLToPath(import.meta.url), '../../');

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
  const buildContext = await context(BUILD_OPTIONS);

  // We are both hosting the development server and writing to file output.
  // The file output is for Docker containers.
  const [, { host, port }] = await Promise.all([buildContext.watch(), buildContext.serve()]);

  console.log(`[serve] listening to http://${host}:${port}/.`);
})();
