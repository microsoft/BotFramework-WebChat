import { defineConfig } from 'tsdown';

import { createDualFormatConfigs, type Config } from '../../tsdown.base.config.mts';

// The build entry runs in Node.js (bundler plugins).
const withNodeBuiltins = (config: Config): Partial<Config> => ({ deps: { ...config.deps, neverBundle: [/^node:/u] } });

export default defineConfig(
  createDualFormatConfigs(
    {
      'botframework-webchat-styles': './src/index.ts',
      'botframework-webchat-styles.build': './src/build/index.ts',
      'botframework-webchat-styles.react': './src/react/index.ts'
    },
    { cjs: withNodeBuiltins, esm: withNodeBuiltins }
  )
);
