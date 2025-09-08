import { defineConfig } from 'tsup';
import baseConfig from '../../tsup.base.config';

// TODO: [P1] Compute this automatically.
const DEPENDENT_PATHS = ['component', 'fluent-theme'];

const config: typeof baseConfig = {
  ...baseConfig,
  entry: {
    'botframework-webchat-styles': './src/index.ts',
    'botframework-webchat-styles.build': './src/build/index.ts',
    'botframework-webchat-styles.react': './src/react/index.ts'
  },
  onSuccess: `${baseConfig.onSuccess} && touch ${DEPENDENT_PATHS.map(path => `../${path}/src/buildInfo.ts`).join(' ')}`
};

export default defineConfig([
  {
    ...config,
    env: { ...config.env, module_format: 'esmodules' },
    format: 'esm'
  },
  {
    ...config,
    env: { ...config.env, module_format: 'commonjs' },
    format: 'cjs',
    target: [...config.target, 'es2019']
  }
]);
