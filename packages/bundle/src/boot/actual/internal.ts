// We should review exports in this file to make sure 1P = 3P.
export { type ActivityMiddleware, type TypingIndicatorMiddleware } from 'botframework-webchat-api';
export {
  createActivityBorderMiddleware,
  createActivityGroupingMiddleware,
  DecoratorComposer,
  type DecoratorMiddleware
} from 'botframework-webchat-api/decorator';
export { WebChatDecorator } from 'botframework-webchat-component/decorator';
export { createIconComponent, PartGrouping, useLiveRegion } from 'botframework-webchat-component/internal';
export { getOrgSchemaMessage, type DirectLineCardAction, type WebChatActivity } from 'botframework-webchat-core';
