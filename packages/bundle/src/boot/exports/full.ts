import { buildInfo as actualBuildInfo } from '../actual/full';
import addVersion from '../addVersion';

export * from '../actual/full';

export const buildInfo = Object.freeze({ ...actualBuildInfo, variant: 'full' });

addVersion(buildInfo);
