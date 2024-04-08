import { defineConfig } from 'tsup';

export default defineConfig([
  {
    dts: true,
    entry: ['./src/index.ts'],
    esbuildOptions(options) {
      options.define.NPM_PACKAGE_VERSION = JSON.stringify(process.env.npm_package_version);
    },
    format: ['cjs', 'esm'],
    sourcemap: true
  },
  {
    conditions: ['browser'],
    entry: {
      'botframework-webchat-fluent-theme.production.min': './src/bundle.ts'
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
    sourcemap: true
  }
]);
