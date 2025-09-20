export { concatMiddleware, localize } from 'botframework-webchat-api';
export { type WebChatActivity } from 'botframework-webchat-core';

export { default as createCoreAttachmentMiddleware } from './Attachment/createMiddleware';
export { default as Context } from './hooks/internal/WebChatUIContext';
export { default as createCoreActivityMiddleware } from './Middleware/Activity/createCoreMiddleware';
export { default as createCoreActivityStatusMiddleware } from './Middleware/ActivityStatus/createCoreMiddleware';
export {
  type HTMLContentTransformEnhancer,
  type HTMLContentTransformFunction,
  type HTMLContentTransformMiddleware,
  type HTMLContentTransformRequest
} from './providers/HTMLContentTransformCOR/index';
export { default as createStyleSet } from './Styles/createStyleSet';
export { default as testIds } from './testIds';
export { default as getTabIndex } from './Utils/TypeFocusSink/getTabIndex';
export { default as withEmoji } from './withEmoji/withEmoji';

export type * from './boot/component';
export * as Components from './boot/component';
export type * from './boot/hook';
export * as hooks from './boot/hook';

export { ReactWebChat as default } from './boot/component';

// #region Build info
import buildInfo from './buildInfo';

const { object: buildInfoObject, version } = buildInfo;

export { buildInfoObject as buildInfo, version };
// #endregion
