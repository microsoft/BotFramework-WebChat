import { injectCSSRolldownPlugin } from '@msinternal/botframework-webchat-styles/build';
import { join } from 'node:path';
import { defineConfig, type Rolldown } from 'tsdown';

import { createDualFormatConfigs, iifeOptions, packagePattern, type Config } from '../../tsdown.base.config.mts';
import { bundleStyleContent as bundleStyleContentPlaceholder } from './src/stylesheet/createBundleStyleElements.ts';

// Redirect import paths for "react" and "react-dom"
const resolveReact: Rolldown.Plugin = {
  name: 'isomorphic-react',
  resolveId: {
    filter: { id: /^(?:react|react-dom)$/u },
    handler: pkgName =>
      join(process.cwd(), '../../node_modules', `@msinternal/isomorphic-${pkgName}/dist/${pkgName}.js`)
  }
};

function withPackageOptions(config: Config, moduleFormat: string): Partial<Config> {
  return {
    define: { ...config.define, 'globalThis.WEB_CHAT_BUILD_INFO_MODULE_FORMAT': JSON.stringify(moduleFormat) },
    deps: {
      ...config.deps,
      alwaysBundle: [
        '@babel/runtime',
        'memoize-one',
        'microsoft-cognitiveservices-speech-sdk',
        // sanitize-html@2.17.6+ requires htmlparser2@12+, which is ESM-only and ships syntax newer than ES2019 (with domhandler, domutils,
        // dom-serializer and entities). Bundling lowers it to ES2019, so webpack 4 and CommonJS consumers (e.g. Jest) need no extra setup.
        'sanitize-html',
        'web-speech-cognitive-services',
        // Belows are the dependency chain related to "regex" where it is named export-only and does not work on Webpack 4/PPUX (CJS cannot import named export).
        // Webpack 4: "Can't import the named export 'rewrite' from non EcmaScript module (only default export is available)"
        'shiki', // shiki -> @shikijs/core -> @shikijs/engine-javascript -> regex
        // Issues related to Webpack 4 when it tries to statically analyze dependencies.
        // The way `microsoft-cognitiveservices-speech-sdk` imported the `uuid` package (in their `Guid.js`) is causing esbuild/tsup to proxy require() into __require() for dynamic loading.
        // Webpack 4 cannot statically analyze the code and failed with error "Critical dependency: require function is used in a way in which dependencies cannot be statically extracted".
        'uuid'
      ].map(packagePattern)
    },
    plugins: [
      ...config.plugins,
      injectCSSRolldownPlugin({
        ignoreCSSEntries: ['dist/botframework-webchat.component.css'],
        stylesPlaceholder: bundleStyleContentPlaceholder
      })
    ]
  };
}

const [esmConfig, cjsConfig] = createDualFormatConfigs(
  {
    'botframework-webchat': './src/boot/exports/index.ts',
    'botframework-webchat.component': './src/boot/exports/component.ts',
    'botframework-webchat.decorator': './src/boot/exports/decorator.ts',
    'botframework-webchat.hook': './src/boot/exports/hook.ts',
    'botframework-webchat.internal': './src/boot/exports/internal.ts',
    'botframework-webchat.middleware': './src/boot/exports/middleware.ts',
    'botframework-webchat.schema': './src/boot/exports/schema.ts'
  },
  {
    cjs: config => withPackageOptions(config, 'commonjs'),
    esm: config => withPackageOptions(config, 'esmodules')
  }
);

function createIIFEConfig(name: 'webchat' | 'webchat-es5' | 'webchat-minimal'): Config {
  return {
    ...esmConfig,
    ...iifeOptions(esmConfig),
    define: { ...esmConfig.define, 'globalThis.WEB_CHAT_BUILD_INFO_MODULE_FORMAT': '"global"' },
    entry: { [name]: `./src/boot/iife/${name}.ts` },
    onSuccess: undefined,
    plugins: [...esmConfig.plugins, resolveReact]
  };
}

export default defineConfig([
  // Build IIFE before CJS/ESM to make npm start faster.
  createIIFEConfig('webchat'),
  createIIFEConfig('webchat-es5'),
  createIIFEConfig('webchat-minimal'),
  esmConfig,
  cjsConfig
]);
