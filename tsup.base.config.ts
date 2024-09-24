import { defineConfig, type Options } from 'tsup';
import { babelPlugin, defaultPredicate, type Predicate } from './esbuildBabelPluginIstanbul';

const env = process.env.NODE_ENV || 'development';
const { npm_package_version } = process.env;
const istanbulPredicate: Predicate = args => defaultPredicate(args) && !/\.worker\.[cm]?[jt]s$/u.test(args.path);

export default defineConfig({
  dts: true,
  env: {
    build_tool: 'tsup',
    module_format: 'esmodules',
    node_env: env,
    NODE_ENV: env,
    ...(npm_package_version ? { npm_package_version } : {})
  },
  esbuildOptions: options => {
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
          })
        ]
      : [],
  format: 'esm',
  loader: { '.js': 'jsx' },
  metafile: true,
  minify: env === 'production',
  platform: 'browser',
  sourcemap: true,
  target: ['chrome100', 'firefox100', 'safari15']
}) as Options;
