import ReactWebChat, { buildInfo as actualBuildInfo } from '../actual/full';
import addVersion from '../addVersion';

const buildInfo = Object.freeze({ ...actualBuildInfo, moduleFormat: process.env.module_format });

export * from '../actual/full';
export { buildInfo };
export default ReactWebChat;

addVersion(buildInfo);
