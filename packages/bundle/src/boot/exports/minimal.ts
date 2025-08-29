import ReactWebChat, { buildInfo as actualBuildInfo } from '../actual/minimal';
import addVersion from '../addVersion';

const buildInfo = Object.freeze({ ...actualBuildInfo, moduleFormat: process.env.module_format });

export * from '../actual/minimal';
export { buildInfo };
export default ReactWebChat;

addVersion(buildInfo);
