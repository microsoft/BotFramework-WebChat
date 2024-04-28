import { join } from 'path';
import { defineConfig } from 'tsup';
import { fileURLToPath } from 'url';
import baseConfig from '../../tsup.base.config';
import { injectedStyles as injectedStylesPlaceholder } from './src/styles/injectStyle';

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

const injectCSSPlugin = {
  name: 'inject-css-plugin',
  setup(build) {
    build.onEnd(result => {
      const js = result.outputFiles.find(f => f.path.match(/(\.js|\.mjs)$/u));
      const css = result.outputFiles.find(f => f.path.match(/(\.css)$/u));
      if (css && js?.text.includes(injectedStylesPlaceholder)) {
        js.contents = Buffer.from(js.text.replace(`"${injectedStylesPlaceholder}"`, JSON.stringify(css.text)));
      }
    });
  }
};

export default defineConfig([
  {
    ...baseConfig,
    entry: { 'botframework-webchat-fluent-theme': './src/index.ts' },
    loader: {
      ...baseConfig.loader,
      '.css': 'local-css'
    },
    esbuildPlugins: [...(baseConfig.esbuildPlugins || []), injectCSSPlugin],
    // esbuildOptions(options) {
    //   options.define.NPM_PACKAGE_VERSION = JSON.stringify(process.env.npm_package_version);
    // },
    format: ['cjs', 'esm']
  },
  {
    ...baseConfig,
    entry: { 'botframework-webchat-fluent-theme.development': './src/bundle.ts' },
    loader: {
      ...baseConfig.loader,
      '.css': 'local-css'
    },
    // esbuildOptions(options) {
    //   options.define.NPM_PACKAGE_VERSION = JSON.stringify(process.env.npm_package_version);
    //   options.define['process.env.NODE_ENV'] = '"development"';
    // },
    esbuildPlugins: [...(baseConfig.esbuildPlugins || []), injectCSSPlugin, umdResolvePlugin],
    format: 'iife',
    outExtension() {
      return { js: '.js' };
    }
  },
  {
    ...baseConfig,
    entry: { 'botframework-webchat-fluent-theme.production.min': './src/bundle.ts' },
    loader: {
      ...baseConfig.loader,
      '.css': 'local-css'
    },
    // esbuildOptions(options) {
    //   options.define.NPM_PACKAGE_VERSION = JSON.stringify(process.env.npm_package_version);
    //   options.define['process.env.NODE_ENV'] = '"production"';
    // },
    esbuildPlugins: [...(baseConfig.esbuildPlugins || []), injectCSSPlugin, umdResolvePlugin],
    format: 'iife',
    minify: true,
    outExtension() {
      return { js: '.js' };
    }
  }
]);
