import { defineConfig, type Options } from 'tsup';
import { defaultPredicate, plugin, type Predicate } from './esbuildBabelPluginIstanbul';

const env = process.env.NODE_ENV || 'development';
const { npm_package_version } = process.env;
const istanbulPredicate: Predicate = args => defaultPredicate(args) && !/\.worker\.[cm]?[jt]s$/u.test(args.path);

export default defineConfig({
  dts: true,
  env: {
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
          plugin({ filter: /\.[cm]?js$/u, loader: 'jsx', name: 'istanbul-loader-js', predicate: istanbulPredicate }),
          plugin({ filter: /\.jsx$/u, loader: 'jsx', name: 'istanbul-loader-jsx', predicate: istanbulPredicate }),
          plugin({ filter: /\.[cm]?ts$/u, loader: 'ts', name: 'istanbul-loader-ts', predicate: istanbulPredicate }),
          plugin({ filter: /\.tsx$/u, loader: 'tsx', name: 'istanbul-loader-tsx', predicate: istanbulPredicate })
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
