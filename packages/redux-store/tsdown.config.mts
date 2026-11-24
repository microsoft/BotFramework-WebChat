import { defineConfig } from 'tsdown';

import { createDualFormatConfigs } from '../../tsdown.base.config.mts';

export default defineConfig(createDualFormatConfigs({ 'botframework-webchat-redux-store': './src/index.ts' }));
