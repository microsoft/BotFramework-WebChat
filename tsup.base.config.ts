import { esbuildPluginIstanbul } from 'esbuild-plugin-istanbul';
import { readFile } from 'fs/promises';
import { defineConfig, type Options } from 'tsup';

const env = process.env.NODE_ENV || 'development';
const { npm_package_version } = process.env;

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
          // Skip *.worker.js from adding instrumentation code.
          {
            name: 'worker-file',
            setup(build) {
              build.onLoad({ filter: /\.worker\.[cm]?js$/u }, async args => ({
                // eslint-disable-next-line security/detect-non-literal-fs-filename
                contents: await readFile(args.path, 'utf-8')
              }));
            }
          },
          esbuildPluginIstanbul({ filter: /\.[cm]?js$/u, loader: 'jsx', name: 'istanbul-loader-js' }),
          esbuildPluginIstanbul({ filter: /\.jsx$/u, loader: 'jsx', name: 'istanbul-loader-jsx' }),
          esbuildPluginIstanbul({ filter: /\.[cm]?ts$/u, loader: 'ts', name: 'istanbul-loader-ts' }),
          esbuildPluginIstanbul({ filter: /\.tsx$/u, loader: 'tsx', name: 'istanbul-loader-tsx' })
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
