import { join } from 'node:path';
import { defineConfig } from 'tsdown';
import { fileURLToPath } from 'node:url';
import baseConfig from '../../tsdown.base.config';
import { fluentStyleContent as fluentStyleContentPlaceholder } from './src/styles/createStyles';
import { injectCSSPlugin } from 'botframework-webchat-styles/build';
import LightningCSS from 'unplugin-lightningcss';

const umdResolvePlugin = {
  name: 'umd-resolve',
  setup(build) {
    build.onResolve({ filter: /^react$/u }, () => ({
      path: join(fileURLToPath(import.meta.url), '../src/external.umd/react.ts')
    }));

    build.onResolve({ filter: /^botframework-webchat-api$/u }, () => ({
      path: join(fileURLToPath(import.meta.url), '../src/external.umd/botframework-webchat-api/index.ts')
    }));

    build.onResolve({ filter: /^botframework-webchat-api\/decorator$/u }, () => ({
      path: join(fileURLToPath(import.meta.url), '../src/external.umd/botframework-webchat-api/decorator.ts')
    }));

    build.onResolve({ filter: /^botframework-webchat-component$/u }, () => ({
      path: join(fileURLToPath(import.meta.url), '../src/external.umd/botframework-webchat-component/index.ts')
    }));

    build.onResolve({ filter: /^botframework-webchat-component\/internal$/u }, () => ({
      path: join(fileURLToPath(import.meta.url), '../src/external.umd/botframework-webchat-component/internal.ts')
    }));

    build.onResolve({ filter: /^botframework-webchat-component\/decorator$/u }, () => ({
      path: join(fileURLToPath(import.meta.url), '../src/external.umd/botframework-webchat-component/decorator.ts')
    }));
  }
};

export default defineConfig([
  {
    ...baseConfig,
    entry: { 'botframework-webchat-fluent-theme': './src/index.ts' },
    env: { ...baseConfig.env, module_format: 'commonjs' },
    plugins: [
      LightningCSS.rolldown()
    ],
    esbuildPlugins: [
      ...(baseConfig.esbuildPlugins || []),
      injectCSSPlugin({ stylesPlaceholder: fluentStyleContentPlaceholder })],
    format: ['cjs'],
    target: [...baseConfig.target, 'es2019']
  },
  {
    ...baseConfig,
    entry: { 'botframework-webchat-fluent-theme': './src/index.ts' },
    plugins: [
      LightningCSS.rolldown()
    ],
    esbuildPlugins: [
      ...(baseConfig.esbuildPlugins || []),
      injectCSSPlugin({ stylesPlaceholder: fluentStyleContentPlaceholder })],
    format: ['esm']
  },
  {
    ...baseConfig,
    entry: { 'botframework-webchat-fluent-theme.development': './src/bundle.ts' },
    esbuildPlugins: [
      ...(baseConfig.esbuildPlugins || []),
      injectCSSPlugin({ stylesPlaceholder: fluentStyleContentPlaceholder }),
      umdResolvePlugin
    ],
    plugins: [
      LightningCSS.rolldown()
    ],
    format: 'iife',
    outExtension() {
      return { js: '.js' };
    }
  },
  {
    ...baseConfig,
    entry: { 'botframework-webchat-fluent-theme.production.min': './src/bundle.ts' },
    esbuildPlugins: [
      ...(baseConfig.esbuildPlugins || []),
      injectCSSPlugin({ stylesPlaceholder: fluentStyleContentPlaceholder }),
      umdResolvePlugin
    ],
    plugins: [
      LightningCSS.rolldown()
    ],
    format: 'iife',
    minify: true,
    outExtension() {
      return { js: '.js' };
    }
  }
]);
