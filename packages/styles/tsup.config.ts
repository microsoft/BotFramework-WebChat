import { defineConfig } from 'tsup';
import baseConfig from '../../tsup.base.config';

// TODO: [P1] Compute this automatically.
const DEPENDENT_PATHS = ['component/src/index.ts', 'fluent-theme/src/index.ts'];

const commonConfig: typeof baseConfig = {
  ...baseConfig,
  entry: {
    'botframework-webchat-styles': './src/index.ts',
    'botframework-webchat-styles.build': './src/build/index.ts',
    'botframework-webchat-styles.react': './src/react/index.ts'
  },
  onSuccess: `${baseConfig.onSuccess} && touch ${DEPENDENT_PATHS.map(path => `../${path}`).join(' ')}`
};

export default defineConfig([
  {
    ...commonConfig,
    env: { ...commonConfig.env, module_format: 'esmodules' },
    format: 'esm'
  },
  {
    ...commonConfig,
    env: { ...commonConfig.env, module_format: 'commonjs' },
    format: 'cjs',
    target: [...commonConfig.target, 'es2019']
  }
]);
