import { makeCreateStyles } from '@msinternal/botframework-webchat-styles';

const chatLauncherStyleContent = '@--CHAT-LAUNCHER-STYLES-CONTENT--@';

const createChatLauncherStyleElements = makeCreateStyles(chatLauncherStyleContent);

export default createChatLauncherStyleElements;
export { chatLauncherStyleContent };
