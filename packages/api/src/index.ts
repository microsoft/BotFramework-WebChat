export type {
  /** @deprecated Use `polymiddleware` instead, this will be removed on or after 2027-08-16. */
  LegacyActivityComponentFactory as ActivityComponentFactory,
  /** @deprecated Use `polymiddleware` instead, this will be removed on or after 2027-08-16. */
  LegacyActivityMiddleware as ActivityMiddleware,
  /** @deprecated Use `polymiddleware` instead, this will be removed on or after 2027-08-16. */
  LegacyAttachmentMiddleware as AttachmentMiddleware,
  LegacyRenderAttachment as RenderAttachment
} from '@msinternal/botframework-webchat-api-middleware/legacy';

export * as hooks from './boot/hook';
export { default as defaultStyleOptions } from './defaultStyleOptions';
export { default as Composer, type ComposerProps } from './hooks/Composer';
export { default as concatMiddleware } from './hooks/middleware/concatMiddleware';
export { type ActivityStatusRenderer } from './hooks/useCreateActivityStatusRenderer'; // TODO: [P1] This line should export the one from the version from "middleware rework" workstream.
export { type DebouncedNotification, type DebouncedNotifications } from './hooks/useDebouncedNotifications';
export { type PostActivityFile } from './hooks/useSendFiles';
export { localize } from './localization/Localize';
export {
  extractSendBoxMiddleware,
  SendBoxMiddlewareProxy,
  type SendBoxMiddleware,
  type SendBoxMiddlewareProps,
  type SendBoxMiddlewareRequest
} from './middleware/SendBoxMiddleware';
export {
  extractSendBoxToolbarMiddleware,
  SendBoxToolbarMiddlewareProxy,
  type SendBoxToolbarMiddleware,
  type SendBoxToolbarMiddlewareProps,
  type SendBoxToolbarMiddlewareRequest
} from './middleware/SendBoxToolbarMiddleware';
export { default as normalizeStyleOptions } from './normalizeStyleOptions';
export { type StrictStyleOptions, type default as StyleOptions } from './StyleOptions';
export { type ActivityStatusMiddleware, type RenderActivityStatus } from './types/ActivityStatusMiddleware';
export {
  type AttachmentForScreenReaderComponentFactory,
  type default as AttachmentForScreenReaderMiddleware
} from './types/AttachmentForScreenReaderMiddleware';
export { type AvatarComponentFactory, type default as AvatarMiddleware } from './types/AvatarMiddleware';
export { type default as CardActionMiddleware, type PerformCardAction } from './types/CardActionMiddleware';
export { type ContextOf } from './types/ContextOf';
export { type GroupActivities, type default as GroupActivitiesMiddleware } from './types/GroupActivitiesMiddleware';
export { type Notification } from './types/Notification';
export {
  type ScrollToEndButtonComponentFactory,
  type default as ScrollToEndButtonMiddleware
} from './types/ScrollToEndButtonMiddleware';
export { type SendStatus } from './types/SendStatus';
export { type RenderToast, type default as ToastMiddleware } from './types/ToastMiddleware';
export { type Typing } from './types/Typing';
export {
  type RenderTypingIndicator,
  type default as TypingIndicatorMiddleware
} from './types/TypingIndicatorMiddleware';
export { type WebSpeechPonyfill } from './types/WebSpeechPonyfill';
export { type WebSpeechPonyfillFactory } from './types/WebSpeechPonyfillFactory';

// #region Build info
import buildInfo from './buildInfo';

const { object: buildInfoObject, version } = buildInfo;

export { buildInfoObject as buildInfo, version };
// #endregion
