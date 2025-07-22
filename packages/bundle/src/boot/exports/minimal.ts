import { buildInfo as actualBuildInfo } from '../actual/minimal';
import addVersion from '../addVersion';

export * from '../actual/minimal';

export const buildInfo = Object.freeze({ ...actualBuildInfo, variant: 'minimal' });

addVersion(buildInfo);
