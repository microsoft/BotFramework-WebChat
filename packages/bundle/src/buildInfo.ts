import { createBuildInfo } from '@msinternal/botframework-webchat-base/utils';

const buildInfo = createBuildInfo('botframework-webchat');

buildInfo.set('buildTool', WEB_CHAT_BUILD_INFO_BUILD_TOOL);
buildInfo.set('moduleFormat', WEB_CHAT_BUILD_INFO_MODULE_FORMAT);
buildInfo.set('version', WEB_CHAT_BUILD_INFO_VERSION);

export default buildInfo;
