import { defineConfig } from 'tsdown';

import { createDualFormatConfigs } from '../../tsdown.base.config.mts';

export default defineConfig(
  createDualFormatConfigs({
    'botframework-webchat-base': './src/index.ts',
    'botframework-webchat-base.utils': './src/utils/index.ts',
    'botframework-webchat-base.valibot': './src/valibot/index.ts'
  })
);
