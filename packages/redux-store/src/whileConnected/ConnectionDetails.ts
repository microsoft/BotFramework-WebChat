import { type DirectLineJSBotConnection } from 'botframework-webchat-core';

type ConnectionDetails = Readonly<{
  directLine: DirectLineJSBotConnection;
  userId: string;
  username: string;
}>;

export { type ConnectionDetails };
