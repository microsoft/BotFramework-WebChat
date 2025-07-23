import { type Options } from 'tsup';
import { babelPlugin, defaultPredicate, type Predicate } from './esbuildBabelPluginIstanbul';
import lightningCssPlugin from 'unplugin-lightningcss/esbuild';

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

const baseConfig: Options & { target: Target[] } = {
  dts: true,
  env: {
    build_tool: 'tsup',
    node_env: env,
    NODE_ENV: env,
    ...(npm_package_version ? { npm_package_version } : {})
  },
  plugins: [disablePlugin('postcss'), disablePlugin('svelte')],
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
            filter: /\.[cm]?js$/u,
            loader: 'jsx',
            name: 'babel-plugin-istanbul:js',
            predicate: istanbulPredicate
          }),
          babelPlugin({
            filter: /\.jsx$/u,
            loader: 'jsx',
            name: 'babel-plugin-istanbul:jsx',
            predicate: istanbulPredicate
          }),
          babelPlugin({
            filter: /\.[cm]?ts$/u,
            loader: 'ts',
            name: 'babel-plugin-istanbul:ts',
            predicate: istanbulPredicate
          }),
          babelPlugin({
            filter: /\.tsx$/u,
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
  sourcemap: true,
  splitting: true,
  target: ['chrome100', 'firefox100', 'safari15'] satisfies Target[]
};

export default baseConfig;
