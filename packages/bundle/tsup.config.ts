import path from 'path';
import { defineConfig } from 'tsup';

const env = process.env.NODE_ENV || 'production';

// Redirect import paths for "microsoft-cognitiveservices-speech-sdk(...)"
// to point to es2015 distribution for all importing modules
const resolveCognitiveServicesToES2015 = {
  name: 'microsoft-cognitiveservices-speech-sdk',
  setup(build) {
    build.onResolve({ filter: /microsoft-cognitiveservices-speech-sdk.+/u }, args => ({
      path: path.join(process.cwd(), '../../node_modules', args.path.replace('distrib/lib', 'distrib/es2015') + '.js')
    }));
  }
};

export default defineConfig({
  name: 'WebChat ESM Build',
  entry: {
    'webchat-esm': 'src/index.ts'
  },
  platform: 'browser',
  splitting: false,
  sourcemap: false,
  clean: true,
  format: 'esm',
  treeshake: false,
  minify: !!env && env === 'production',
  metafile: true,
  inject: ['isomorphic-react', 'isomorphic-react-dom'],
  esbuildOptions: options => {
    options.legalComments = 'linked';
  },
  esbuildPlugins: [resolveCognitiveServicesToES2015],
  target: ['chrome100', 'firefox100', 'safari15'],
  env: {
    node_env: env,
    NODE_ENV: env
  }
});
