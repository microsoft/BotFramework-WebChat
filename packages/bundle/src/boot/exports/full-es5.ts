import { buildInfo as actualBuildInfo } from '../actual/full-es5';
import addVersion from '../addVersion';

export * from '../actual/full-es5';

export const buildInfo = Object.freeze({ ...actualBuildInfo, variant: 'full-es5' });

addVersion(buildInfo);
