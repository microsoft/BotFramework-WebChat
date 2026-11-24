import { defineConfig } from 'tsdown';

import { createDualFormatConfigs } from '../../tsdown.base.config.mts';

export default defineConfig(
  createDualFormatConfigs({
    'botframework-webchat-api-middleware': './src/index.ts',
    'botframework-webchat-api-middleware.legacy': './src/legacy.ts'
  })
);
