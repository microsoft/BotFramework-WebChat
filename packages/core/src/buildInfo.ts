import { createBuildInfo } from '@msinternal/botframework-webchat-base/utils';

const buildInfo = createBuildInfo('botframework-webchat:core');

buildInfo.set('buildTool', globalThis.WEB_CHAT_BUILD_INFO_BUILD_TOOL);
buildInfo.set('moduleFormat', globalThis.WEB_CHAT_BUILD_INFO_MODULE_FORMAT);
buildInfo.set('version', globalThis.WEB_CHAT_BUILD_INFO_VERSION);

export default buildInfo;
