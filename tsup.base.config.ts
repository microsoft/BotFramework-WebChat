import { type Options } from 'tsup';

import { babelPlugin, defaultPredicate, type Predicate } from './esbuildBabelPluginIstanbul';
import { cssPlugin } from './esbuildPlugins.mjs';

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

function applyConfig(
  overrideOptions: (
    options: Omit<Options, 'entry'> & {
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
  return overrideOptions({
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
    ignoreWatch: './dist/',
    loader: { '.js': 'jsx' },
    metafile: true,
    minify: env === 'production' || env === 'test',
    platform: 'browser',
    plugins: [disablePlugin('postcss'), disablePlugin('svelte')],
    sourcemap: true,
    splitting: true,
    target: ['chrome100', 'firefox100', 'safari15'] satisfies Target[]
  });
}

export { applyConfig };
