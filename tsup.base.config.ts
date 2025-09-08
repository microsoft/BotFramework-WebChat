import { type Options } from 'tsup';
import lightningCssPlugin from 'unplugin-lightningcss/esbuild';
import { babelPlugin, defaultPredicate, type Predicate } from './esbuildBabelPluginIstanbul';

type Target = Exclude<Options['target'], Array<unknown> | undefined>;

const env = process.env.NODE_ENV || 'development';
const { npm_package_version } = process.env;
const istanbulPredicate: Predicate = args => defaultPredicate(args) && !/\.worker\.[cm]?[jt]s$/u.test(args.path);

type Plugin = NonNullable<Options['plugins']>[number];
const disablePlugin = (pluginName: string): Plugin => ({
  name: `disable-plugin-${pluginName}`,
  esbuildOptions: options => {
    const plugin = options.plugins?.find(({ name }) => name === pluginName);
    if (plugin) {
      plugin.setup = () => Promise.resolve();
    }
  }
});

const cssPlugin = lightningCssPlugin({
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
});

const baseConfig: Options & {
  define: Record<string, string>;
  esbuildPlugins: Plugin[];
  onSuccess: string;
  target: Target[];
} = {
  define: {
    WEB_CHAT_BUILD_INFO_BUILD_TOOL: '"tsup"',
    WEB_CHAT_BUILD_INFO_MODULE_FORMAT: '"unknown"',
    WEB_CHAT_BUILD_INFO_VERSION: JSON.stringify(process.env.npm_package_version || '0.0.0-unknown')
  },
  dts: true,
  env: {
    build_tool: 'tsup',
    module_format: '', // Catchall
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
  target: ['chrome100', 'firefox100', 'safari15'] satisfies Target[],

  // tsup@8.5.0 do not write to output atomically.
  // Thus, when building in parallel, some of the files will be emptied.
  // We are writing output to /dist.tmp/ and copy everything back to /dist/.
  // "onSuccess" runs before DTS, we need to wait until *.d.ts are emitted.
  onSuccess: 'while [ ! -f ./dist.tmp/*.d.ts ]; do sleep 0.2; done; mkdir -p ./dist/ && cp ./dist.tmp/* ./dist/',
  outDir: './dist.tmp/'
};

export default baseConfig;
