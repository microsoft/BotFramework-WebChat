import { buildInfo as minimalBuildInfo } from './exports-minimal';

export * from './exports';

const buildInfo = Object.freeze({ ...minimalBuildInfo, variant: 'full-es5' });

export { buildInfo };
