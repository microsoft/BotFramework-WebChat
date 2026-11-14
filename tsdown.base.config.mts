import { type UserConfig } from 'tsdown';

import { istanbulPlugin } from './rolldownPlugins.mjs';

const env = process.env.NODE_ENV || 'development';
const { npm_package_version } = process.env;
const minify = env === 'production' || env === 'test';
const TARGET = Object.freeze(['chrome100', 'firefox100', 'safari15']);

// When minified, esbuild drops annotations (`/* @__PURE__ */`) and JSDoc comments, rolldown keeps them by default.
const MINIFIED_COMMENTS = Object.freeze({ annotation: false, jsdoc: false, legal: true });

type Config = UserConfig & {
  define: Record<string, string>;
  plugins: NonNullable<UserConfig['plugins']>[];
  target: string[];
};

// Port of tsup.base.config.ts.
function applyConfig(overrideOptions: (options: Omit<Config, 'entry'>) => Config): Config {
  return overrideOptions({
    define: {
      // TSD does not support define, thus we need to use `globalThis.*` instead.
      'globalThis.WEB_CHAT_BUILD_INFO_BUILD_TOOL': '"tsdown"',
      'globalThis.WEB_CHAT_BUILD_INFO_MODULE_FORMAT': '"unknown"',
      'globalThis.WEB_CHAT_BUILD_INFO_VERSION': JSON.stringify(npm_package_version || '0.0.0-unknown'),
      // Removes AMD glue code (anonymous `define()` conflicts with RequireJS), see /__tests__/html2/hosting/requirejs.html.
      define: 'undefined'
    },
    deps: {
      // Like tsup (rollup-plugin-dts), `.d.ts` import the types of every package instead of inlining them, even with
      // `deps.alwaysBundle` (tsup `noExternal`). Packages that need them inlined run dtsroll after the build.
      dts: { alwaysBundle: [], neverBundle: true },
      // devDependencies are bundled on purpose, like tsup.
      onlyBundle: false
    },
    dts: {
      // rolldown-plugin-dts emits declarations module by module as they load, and TypeScript 6 prints union members in
      // the order it created their types: 2 clean builds printed the same union differently. stableTypeOrdering (hidden
      // TypeScript 6.0 option) orders them like TypeScript 7 does. Remove on TypeScript 7 (always stable).
      compilerOptions: { stableTypeOrdering: true },
      // tsup does not emit declaration maps.
      sourcemap: false
    },
    env: {
      node_env: env,
      NODE_ENV: env,
      ...(npm_package_version ? { npm_package_version } : {})
    },
    format: 'esm',
    ignoreWatch: ['./dist/'],
    inputOptions: (options, format) => ({
      ...options,
      // rolldown warns when JavaScript plugins (istanbul) take most of the build time.
      checks: { ...options.checks, pluginTimings: false },
      // tsdown builds CommonJS for Node.js, ours is for browsers too (uses the "browser" conditions of dependencies).
      ...(format === 'cjs' ? { platform: 'browser' } : {})
    }),
    loader: { '.js': 'jsx' },
    minify,
    outputOptions: options => ({
      ...options,
      ...(options.minify ? { comments: MINIFIED_COMMENTS } : {}),
      // Like esbuild: `__esModule` in every CommonJS entry (rolldown adds it only with a default export).
      esModule: true,
      exports: 'named',
      // Like esbuild: CommonJS and IIFE output start with "use strict".
      strict: true
    }),
    platform: 'browser',
    plugins: env === 'test' ? [istanbulPlugin()] : [],
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
 * Options of an IIFE build, like tsup `format: 'iife'`. rolldown cannot split an IIFE: one entry per config.
 */
function iifeOptions(config: Config): Partial<Config> {
  return {
    // tsup bundles every dependency into an IIFE.
    deps: { ...config.deps, alwaysBundle: () => true },
    dts: false,
    format: 'iife',
    outputOptions: options => ({
      ...options,
      // No bundler reads an IIFE: drop annotations, keep JSDoc unless minified.
      comments: options.minify ? MINIFIED_COMMENTS : { annotation: false, jsdoc: true, legal: true },
      // tsdown names it `<name>.iife.js`.
      entryFileNames: '[name].js',
      // `exports` does not exist in a classic script.
      esModule: false,
      strict: true
    }),
    target: [...config.target, 'es2019']
  };
}

/** tsup `noExternal: ['x']` also bundles "x/y", tsdown `deps.alwaysBundle: ['x']` does not. */
function packagePattern(name: string): RegExp {
  return new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\/]/gu, '\\$&')}(?:/|$)`, 'u');
}

export { applyConfig, createDualFormatConfigs, iifeOptions, packagePattern, type Config };
