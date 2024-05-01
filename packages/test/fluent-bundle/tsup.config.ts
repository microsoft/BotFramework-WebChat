import { defineConfig } from 'tsup';

const target = ['chrome100', 'safari16'];

export default defineConfig([
  {
    dts: true,
    entry: {
      'fluent-bundle': './src/index.ts'
    },
    esbuildOptions(options) {
      options.define.NPM_PACKAGE_VERSION = JSON.stringify(process.env.npm_package_version);
    },
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
