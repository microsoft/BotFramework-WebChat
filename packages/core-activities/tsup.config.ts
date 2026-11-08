import { defineConfig } from 'tsup';

import { applyConfig } from '../../tsup.base.config';

const commonConfig = applyConfig(config => ({
  ...config,
  entry: {
    'botframework-webchat-core-activities': './src/index.ts',
    'botframework-webchat-core-activities.property': './src/property/index.ts'
  },
  // Core bundles this package and these Web Chat packages: import them, so core bundles each one once. Inlined here, core
  // would have a second copy of the parts of them this package uses (and of the core-js internals they bundle).
  external: [
    ...(config.external ?? []),
    '@msinternal/botframework-webchat-base',
    '@msinternal/botframework-webchat-core-graph',
    '@msinternal/botframework-webchat-core-json-ld',
    'botframework-webchat-store'
  ]
}));

export default defineConfig([
  {
    ...commonConfig,
    format: 'esm',
    onSuccess: 'touch ./package.json'
  },
  {
    ...commonConfig,
    format: 'cjs',
    noExternal: ['uuid'],
    target: [...commonConfig.target, 'es2019']
  }
]);
