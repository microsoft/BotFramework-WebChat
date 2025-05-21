import { resolve } from 'path';
import { defineConfig } from 'tsdown';
import { fileURLToPath } from 'url';

const target = ['chrome100', 'safari16'];

const resolveFromProjectRoot = resolve.bind(undefined, fileURLToPath(import.meta.url), '../../');

// This is a plugin for resolving "react" from "isomorphic-react".
// With normal NPM package, we will resolving the actual "react" package.
// "isomorphic-react" exports React from environment (`window.React/ReactDOM`), if exists.
// Otherwise, it fallback to actual "react" package.
// This is to prevent having 2 versions of React running for the same component.
const isomorphicReactResolvePlugin = {
  name: 'isomorphic-react',
  setup(build) {
    // Do not use isomorphic-react when importing from the following paths.
    const excludePaths = [
      resolve(fileURLToPath(import.meta.url), '../node_modules/react-dom') + '/',
      resolve(fileURLToPath(import.meta.url), '../node_modules/react') + '/',
      resolve(fileURLToPath(import.meta.url), '../src') + '/'
    ];

    build.onResolve({ filter: /^react$/u }, result => {
      if (!excludePaths.some(path => result.importer.startsWith(path))) {
        return { path: resolveFromProjectRoot('../../node_modules/isomorphic-react/dist/react.js') };
      }
    });

    build.onResolve({ filter: /^react-dom$/u }, result => {
      if (!excludePaths.some(path => result.importer.startsWith(path))) {
        return { path: resolveFromProjectRoot('../../node_modules/isomorphic-react-dom/dist/react-dom.js') };
      }
    });
  }
};

export default defineConfig([
  {
    dts: true,
    entry: {
      'fluent-bundle': './src/index.ts'
    },
    esbuildOptions(options) {
      options.define.NPM_PACKAGE_VERSION = JSON.stringify(process.env.npm_package_version);
    },
    esbuildPlugins: [isomorphicReactResolvePlugin],
    format: ['cjs', 'esm'],
    sourcemap: true,
    target
  },
  {
    entry: {
      'fluent-bundle.development': './src/bundle.ts'
    },
    esbuildOptions(options) {
      options.define.NPM_PACKAGE_VERSION = JSON.stringify(process.env.npm_package_version);
      options.define['process.env.NODE_ENV'] = '"development"';
    },
    esbuildPlugins: [isomorphicReactResolvePlugin],
    format: 'iife',
    outExtension() {
      return {
        js: '.js'
      };
    },
    sourcemap: true,
    target
  },
  {
    entry: {
      'fluent-bundle.production.min': './src/bundle.ts'
    },
    esbuildOptions(options) {
      options.define.NPM_PACKAGE_VERSION = JSON.stringify(process.env.npm_package_version);
      options.define['process.env.NODE_ENV'] = '"production"';
    },
    esbuildPlugins: [isomorphicReactResolvePlugin],
    format: 'iife',
    minify: true,
    outExtension() {
      return {
        js: '.js'
      };
    },
    sourcemap: true,
    target
  }
]);
