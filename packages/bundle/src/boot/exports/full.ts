import ReactWebChat, { buildInfo as actualBuildInfo } from '../actual/full';
import addVersion from '../addVersion';

export * from '../actual/full';
export default ReactWebChat;
export const buildInfo = Object.freeze({ ...actualBuildInfo, variant: 'full' });

addVersion(buildInfo);
