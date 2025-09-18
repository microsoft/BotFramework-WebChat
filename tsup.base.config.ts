import { type Plugin } from 'esbuild';
import { type Options } from 'tsup';
import lightningCssPlugin from 'unplugin-lightningcss/esbuild';

import { babelPlugin, defaultPredicate, type Predicate } from './esbuildBabelPluginIstanbul';

type Target = Exclude<Options['target'], Array<unknown> | undefined>;

const env = process.env.NODE_ENV || 'development';
const { npm_package_version } = process.env;
const istanbulPredicate: Predicate = args => defaultPredicate(args) && !/\.worker\.[cm]?[jt]s$/u.test(args.path);

type EsbuildPlugin = NonNullable<Options['plugins']>[number];
const disablePlugin = (pluginName: string): EsbuildPlugin => ({
  name: `disable-plugin-${pluginName}`,
  esbuildOptions: options => {
    const plugin = options.plugins?.find(({ name }) => name === pluginName);
    if (plugin) {
      plugin.setup = () => Promise.resolve();
    }
  }
});

// Due to a bug in unplugin, we cannot use the Lightning CSS unplugin directly.
// https://github.com/unjs/unplugin/issues/546
// To workaround the bug, we are converting it back to esbuild plugin so we can apply a custom `filter`.
// Otherwise, unplugin will apply `filter: /.*/` and trigger the bug down the road.
const cssPlugin: Plugin = {
  name: 'lightningcss',
  setup: build => {
    lightningCssPlugin({
      include: [/\.module\.css$/u],
      options: {
        cssModules: {
          pattern: 'w[hash]_[local]',
          pure: true,
          animation: false,
          grid: false,
          customIdents: false
        }
      }
    }).setup({
      ...build,
      // eslint-disable-next-line require-unicode-regexp
      onLoad: (_filter, fn) => build.onLoad({ filter: /(\.module_built\.css|\?css_module)$/ }, fn)
    });
  }
};

function applyConfig(
  overrideOptions: (
    options: Omit<Options, 'entry' | 'onSuccess'> & {
      define: Record<string, string>;
      esbuildPlugins: EsbuildPlugin[];
      target: Target[];
    }
  ) => Options & {
    define: Record<string, string>;
    esbuildPlugins: EsbuildPlugin[];
    target: Target[];
  }
): Options & {
  define: Record<string, string>;
  esbuildPlugins: EsbuildPlugin[];
  target: Target[];
} {
  const nextOptions = overrideOptions({
    define: {
      // TSD does not support define, thus we need to use `globalThis.*` instead.
      'globalThis.WEB_CHAT_BUILD_INFO_BUILD_TOOL': '"tsup"',
      'globalThis.WEB_CHAT_BUILD_INFO_MODULE_FORMAT': '"unknown"',
      'globalThis.WEB_CHAT_BUILD_INFO_VERSION': JSON.stringify(process.env.npm_package_version || '0.0.0-unknown')
    },
    dts: true,
    env: {
      node_env: env,
      NODE_ENV: env,
      ...(npm_package_version ? { npm_package_version } : {})
    },
    esbuildOptions: options => {
      // esbuild don't touch AMD but it also don't remove AMD glue code.
      // Some of our packages prefers AMD over CJS via UMD and it also use anonymous modules.
      // This combination conflict with RequireJS if it present in the system.
      // We are removing AMD glue code manually, just like how Rollup does.
      // Read more at https://github.com/evanw/esbuild/issues/1348.
      // Also https://github.com/rollup/plugins/blob/e1a5ef99f1578eb38a8c87563cb9651db228f3bd/packages/commonjs/src/transform-commonjs.js#L328.
      // Test case at /__tests__/html2/hosting/requirejs.html.
      options.define = options.define || {};
      options.define.define = 'undefined';

      options.legalComments = 'linked';
    },
    esbuildPlugins:
      env === 'test'
        ? [
            babelPlugin({
              // ESBuild use Go regular expressions and does not understand Unicode flag.
              // eslint-disable-next-line require-unicode-regexp
              filter: /\.[cm]?js$/,
              loader: 'jsx',
              name: 'babel-plugin-istanbul:js',
              predicate: istanbulPredicate
            }),
            babelPlugin({
              // ESBuild use Go regular expressions and does not understand Unicode flag.
              // eslint-disable-next-line require-unicode-regexp
              filter: /\.jsx$/,
              loader: 'jsx',
              name: 'babel-plugin-istanbul:jsx',
              predicate: istanbulPredicate
            }),
            babelPlugin({
              // ESBuild use Go regular expressions and does not understand Unicode flag.
              // eslint-disable-next-line require-unicode-regexp
              filter: /\.[cm]?ts$/,
              loader: 'ts',
              name: 'babel-plugin-istanbul:ts',
              predicate: istanbulPredicate
            }),
            babelPlugin({
              // ESBuild use Go regular expressions and does not understand Unicode flag.
              // eslint-disable-next-line require-unicode-regexp
              filter: /\.tsx$/,
              loader: 'tsx',
              name: 'babel-plugin-istanbul:tsx',
              predicate: istanbulPredicate
            }),
            cssPlugin
          ]
        : [cssPlugin],
    format: 'esm',
    loader: { '.js': 'jsx' },
    metafile: true,
    minify: env === 'production' || env === 'test',
    platform: 'browser',
    plugins: [disablePlugin('postcss'), disablePlugin('svelte')],
    sourcemap: true,
    splitting: true,
    target: ['chrome100', 'firefox100', 'safari15'] satisfies Target[]
  });

  // tsup@8.5.0 do not write to output atomically.
  // Thus, when building in parallel, some of the files will be emptied.

  // Writing output to /dist.tmp/ and copy everything back to /dist/ for better atomicity.

  // "onSuccess" runs in parallel of DTS, we need to wait until *.d.ts are emitted.
  // Filed a bug, https://github.com/egoist/tsup/issues/1363.

  // All instances of tsup will try to copy at the same time and could fail with "cp: cannot create regular file './dist/...': File exists".
  // We can have multiple config writing to their own folder and copy-merge. But then each config will own their version of `onSuccess`, could be messy.

  // TODO: [P1] This merge is not elegant, we should move to Promise.
  nextOptions.onSuccess = [
    `while [ -z "$(find ./dist.tmp \\( -name '*.d.ts' -o -name '*.d.mts' \\) -print -quit)" ]; do sleep 0.2; done; mkdir -p ./dist/; sleep 0.5; until cp ./dist.tmp/* ./dist/; do sleep 0.5; done`,
    nextOptions.onSuccess
  ]
    .filter(Boolean)
    .join(' && ');
  nextOptions.outDir = './dist.tmp/';

  return nextOptions;
}

export { applyConfig };
