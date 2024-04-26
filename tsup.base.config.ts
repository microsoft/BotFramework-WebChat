import { defineConfig, type Options } from 'tsup';

const env = process.env.NODE_ENV || 'development';
const { npm_package_version } = process.env;

export default defineConfig({
  env: {
    node_env: env,
    NODE_ENV: env,
    ...(npm_package_version ? { npm_package_version } : {})
  },
  esbuildOptions: options => {
    options.legalComments = 'linked';
  },
  clean: true,
  dts: true,
  format: 'esm',
  loader: { '.js': 'jsx' },
  metafile: true,
  minify: env === 'production',
  platform: 'browser',
  sourcemap: true,
  target: ['chrome100', 'firefox100', 'safari15']
}) as Options;
