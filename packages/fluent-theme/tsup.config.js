import { join } from 'path';
import { defineConfig } from 'tsup';
import { fileURLToPath } from 'url';

const target = ['chrome100', 'safari16'];

const umdResolvePlugin = {
  name: 'umd-resolve',
  setup(build) {
    build.onResolve({ filter: /^react$/u }, () => ({
      path: join(fileURLToPath(import.meta.url), '../src/external.umd/react.ts')
    }));

    build.onResolve({ filter: /^botframework-webchat-api$/u }, () => ({
      path: join(fileURLToPath(import.meta.url), '../src/external.umd/botframework-webchat-api.ts')
    }));

    build.onResolve({ filter: /^botframework-webchat-component$/u }, () => ({
      path: join(fileURLToPath(import.meta.url), '../src/external.umd/botframework-webchat-component.ts')
    }));
  }
};

export default defineConfig([
  {
    dts: true,
    entry: ['./src/index.ts'],
    loader: {
      '.css': 'local-css'
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
      'botframework-webchat-fluent-theme.development': './src/bundle.ts'
    },
    loader: {
      '.css': 'local-css'
    },
    esbuildOptions(options) {
      options.define.NPM_PACKAGE_VERSION = JSON.stringify(process.env.npm_package_version);
      options.define['process.env.NODE_ENV'] = '"development"';
    },
    esbuildPlugins: [umdResolvePlugin],
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
      'botframework-webchat-fluent-theme.production.min': './src/bundle.ts'
    },
    loader: {
      '.css': 'local-css'
    },
    esbuildOptions(options) {
      options.define.NPM_PACKAGE_VERSION = JSON.stringify(process.env.npm_package_version);
      options.define['process.env.NODE_ENV'] = '"production"';
    },
    esbuildPlugins: [umdResolvePlugin],
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
