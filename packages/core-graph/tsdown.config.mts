import { defineConfig } from 'tsdown';

import { createDualFormatConfigs, packagePattern } from '../../tsdown.base.config.mts';

export default defineConfig(
  createDualFormatConfigs(
    { 'botframework-webchat-core-graph': './src/index.ts' },
    { cjs: config => ({ deps: { ...config.deps, alwaysBundle: [packagePattern('uuid')] } }) }
  )
);
