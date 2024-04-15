import type { WebChatActivity } from 'botframework-webchat-core';
import { createPropagation } from 'use-propagate';

const { useListen, usePropagate } = createPropagation<readonly Readonly<WebChatActivity>[]>();

export { useListen, usePropagate };
