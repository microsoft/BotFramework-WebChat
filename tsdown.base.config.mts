import escapeStringRegexp from 'escape-string-regexp';
import { type UserConfig } from 'tsdown';

import { cssPlugin, inputSourceMapPlugin, istanbulPlugin } from './rolldownPlugins.mjs';

const env = process.env.NODE_ENV || 'development';
const { npm_package_version } = process.env;
const minify = env === 'production' || env === 'test';
const TARGET = Object.freeze(['chrome100', 'firefox100', 'safari15']);

// Minified output keeps legal comments only: rolldown keeps annotations (`/* @__PURE__ */`) and JSDoc by default.
const MINIFIED_COMMENTS = Object.freeze({ annotation: false, jsdoc: false, legal: true });

type Config = UserConfig & {
  define: Record<string, string>;
  plugins: NonNullable<UserConfig['plugins']>[];
  target: string[];
};

// Shared options of every tsdown build.
function applyConfig(overrideOptions: (options: Omit<Config, 'entry'>) => Config): Config {
  return overrideOptions({
    // Our cssPlugin (rolldownPlugins.mjs) compiles CSS modules. `false` turns off tsdown's CSS support: without
    // @tsdown/css installed, it fails the build on every `.css` module, ours included.
    css: false,
    define: {
      // TSD does not support define, thus we need to use `globalThis.*` instead.
      'globalThis.WEB_CHAT_BUILD_INFO_BUILD_TOOL': '"tsdown"',
      'globalThis.WEB_CHAT_BUILD_INFO_MODULE_FORMAT': '"unknown"',
      'globalThis.WEB_CHAT_BUILD_INFO_VERSION': JSON.stringify(npm_package_version || '0.0.0-unknown'),
      // Removes AMD glue code (anonymous `define()` conflicts with RequireJS), see /__tests__/html2/hosting/requirejs.html.
      define: 'undefined'
    },
    deps: {
      // `.d.ts` import the types of every package instead of inlining them, also of the packages in
      // `deps.alwaysBundle`. Packages that need them inlined run dtsroll after the build.
      dts: { alwaysBundle: [], neverBundle: true },
      // A package bundles every import outside its dependencies and peerDependencies: our private packages
      // (devDependencies, never published), core-js-pure in base, @jridgewell/sourcemap-codec in styles, and npm
      // packages missing from package.json (e.g. handler-chain in api). `false` only turns off the tsdown hint that
      // lists the bundled npm packages.
      onlyBundle: false
    },
    dts: {
      // rolldown-plugin-dts emits declarations module by module as they load, and TypeScript 6 prints union members in
      // the order it created their types: 2 clean builds printed the same union differently. stableTypeOrdering (hidden
      // TypeScript 6.0 option) orders them like TypeScript 7 does. Remove on TypeScript 7 (always stable).
      compilerOptions: { stableTypeOrdering: true }
    },
    env: {
      node_env: env,
      NODE_ENV: env,
      ...(npm_package_version ? { npm_package_version } : {})
    },
    format: 'esm',
    hooks: {
      // One cssPlugin per build, with the build's own `minify` and `target`: configs change them after applyConfig(),
      // and configs that spread another config would share the plugins in `plugins`.
      'build:before': ({ buildOptions, options: { minify, target = [] } }) => {
        buildOptions.plugins = [buildOptions.plugins, cssPlugin({ minify: !!minify && minify !== 'dce-only', target })];
      }
    },
    // onSuccess touches package.json for `npm start` (notify-build.sh) of dependent packages: `tsdown --watch` would
    // reload its config on every touch.
    ignoreWatch: ['./dist/', './package.json'],
    inputOptions: (options, format) => ({
      ...options,
      // unplugin-lightningcss exports every class as `export { _x as "class-name" }`. String export names need ES2022:
      // rolldown warns for each class in the ES2019 (CommonJS) builds, although bundling removes these exports.
      // rolldown also warns when JavaScript plugins (Lightning CSS, istanbul) take most of the build time.
      checks: { ...options.checks, pluginTimings: false, toleratedTransform: false },
      // tsdown builds CommonJS for Node.js, ours is for browsers too (uses the "browser" conditions of dependencies).
      ...(format === 'cjs' ? { platform: 'browser' } : {})
    }),
    loader: { '.js': 'jsx' },
    minify,
    outputOptions: options => ({
      ...options,
      ...(options.minify ? { comments: MINIFIED_COMMENTS } : {}),
      // `__esModule` in every CommonJS entry, as published so far: bundlers then take a default import from
      // `exports.default`. rolldown adds it only to entries with a default export.
      esModule: true,
      exports: 'named',
      // "use strict" at the top of CommonJS output: our sources are ES modules, which are strict without the directive.
      strict: true
    }),
    platform: 'browser',
    plugins: [inputSourceMapPlugin(), ...(env === 'test' ? [istanbulPlugin()] : [])],
    report: false,
    sourcemap: true,
    target: [...TARGET],
    // Our tsconfig.json are in src/, tsdown looks for one in the package folder.
    tsconfig: './src/tsconfig.json'
  });
}

/** ESM and CommonJS builds of a package, CommonJS also targets ES2019. */
function createDualFormatConfigs(
  entry: Record<string, string>,
  overrides: Partial<Record<'cjs' | 'esm', (config: Config) => Partial<Config>>> = {}
): Config[] {
  return (['esm', 'cjs'] as const).map(format =>
    applyConfig(config => {
      const formatConfig: Config = {
        ...config,
        entry,
        format,
        ...(format === 'esm'
          ? { onSuccess: 'touch ./package.json' }
          : {
              // Compressed re-exports (`enumerable: !0`) are invisible to cjs-module-lexer: Node.js would not see their names.
              minify: config.minify && { compress: false },
              target: [...config.target, 'es2019']
            })
      };

      return { ...formatConfig, ...overrides[format]?.(formatConfig) };
    })
  );
}

/**
 * Options of an IIFE build. rolldown cannot split an IIFE: one entry per config.
 */
function iifeOptions(config: Config): Partial<Config> {
  return {
    // A script tag cannot import: the IIFE bundles every dependency.
    deps: { ...config.deps, alwaysBundle: () => true },
    dts: false,
    format: 'iife',
    outputOptions: options => ({
      ...options,
      // No bundler reads an IIFE: drop annotations, keep JSDoc unless minified.
      comments: options.minify ? MINIFIED_COMMENTS : { annotation: false, jsdoc: true, legal: true },
      // tsdown names it `<name>.iife.js`.
      entryFileNames: '[name].js',
      // One "use strict" for the whole script: rolldown drops the "use strict" of each CommonJS module.
      strict: true
    }),
    target: [...config.target, 'es2019']
  };
}

/** Matches the package and its subpaths ("x", "x/y"): `deps.alwaysBundle: ['x']` matches "x" only. */
function packagePattern(name: string): RegExp {
  return new RegExp(`^${escapeStringRegexp(name)}(?:/|$)`, 'u');
}

export { applyConfig, createDualFormatConfigs, iifeOptions, packagePattern, type Config };
