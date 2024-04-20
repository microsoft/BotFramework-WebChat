import type { WebChatActivity } from 'botframework-webchat-core';

export type Typing = {
  firstAppearAt: number;
  firstTypingActivity: Readonly<WebChatActivity & { type: 'typing' }>;
  lastAppearAt: number;
  lastTypingActivity: Readonly<WebChatActivity & { type: 'typing' }>;
  name: string | undefined;
  role: string;
};
