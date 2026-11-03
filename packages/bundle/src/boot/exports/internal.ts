export * from '../actual/internal';

// Types are exported here instead of `../actual/internal`, see the namespaces in `./minimal.ts`.
export {
  type ActivityMiddleware,
  type ActivityStatusMiddleware,
  type TypingIndicatorMiddleware
} from 'botframework-webchat-api';
export { type HighlightCodeFn } from 'botframework-webchat-component/internal.js';
export { type DirectLineCardAction, type WebChatActivity } from 'botframework-webchat-core';
