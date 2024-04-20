import type { WebChatActivity } from 'botframework-webchat-core';

export type Typing = {
  at: number;
  expireAt: number;
  firstTypingActivity: Readonly<WebChatActivity & { type: 'typing' }>;
  informativeMessage?: string | undefined;
  lastTypingActivity: Readonly<WebChatActivity & { type: 'typing' }>;
  name: string;
  role: 'bot' | 'user';
};
