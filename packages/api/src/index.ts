// TODO: Move the pattern to re-export.
import {
  type LegacyActivityComponentFactory,
  type LegacyActivityMiddleware,
  type LegacyAttachmentMiddleware,
  type LegacyRenderAttachment
} from '@msinternal/botframework-webchat-api-middleware/legacy';
import StyleOptions, { StrictStyleOptions } from './StyleOptions';
import defaultStyleOptions from './defaultStyleOptions';
import Composer, { ComposerProps, ComposerCoreChildrenRenderProp } from './hooks/Composer';
import * as hooks from './hooks/index';
import concatMiddleware from './hooks/middleware/concatMiddleware';
import { type ActivityStatusRenderer } from './hooks/useCreateActivityStatusRenderer'; // TODO: [P1] This line should export the one from the version from "middleware rework" workstream.
import { type DebouncedNotification, type DebouncedNotifications } from './hooks/useDebouncedNotifications';
import { type PostActivityFile } from './hooks/useSendFiles';
import { localize } from './localization/Localize';
import normalizeStyleOptions from './normalizeStyleOptions';
import { type ActivityStatusMiddleware, type RenderActivityStatus } from './types/ActivityStatusMiddleware';
import AttachmentForScreenReaderMiddleware, {
  AttachmentForScreenReaderComponentFactory
} from './types/AttachmentForScreenReaderMiddleware';
import AvatarMiddleware, { type AvatarComponentFactory } from './types/AvatarMiddleware';
import CardActionMiddleware, { type PerformCardAction } from './types/CardActionMiddleware';
import { type ContextOf } from './types/ContextOf';
import GroupActivitiesMiddleware, { type GroupActivities } from './types/GroupActivitiesMiddleware';
import { type Notification } from './types/Notification';
import ScrollToEndButtonMiddleware, {
  type ScrollToEndButtonComponentFactory
} from './types/ScrollToEndButtonMiddleware';
import { type SendStatus } from './types/SendStatus';
import ToastMiddleware, { type RenderToast } from './types/ToastMiddleware';
import { type Typing } from './types/Typing';
import TypingIndicatorMiddleware, { type RenderTypingIndicator } from './types/TypingIndicatorMiddleware';
import { type WebSpeechPonyfill } from './types/WebSpeechPonyfill';
import { type WebSpeechPonyfillFactory } from './types/WebSpeechPonyfillFactory';

// #region Re-export

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
// #endregion

export { Composer, concatMiddleware, defaultStyleOptions, hooks, localize, normalizeStyleOptions };

export type {
  /** @deprecated Use `polymiddleware` instead, this will be removed on or after 2027-08-16. */
  LegacyActivityComponentFactory as ActivityComponentFactory,
  /** @deprecated Use `polymiddleware` instead, this will be removed on or after 2027-08-16. */
  LegacyActivityMiddleware as ActivityMiddleware,
  ActivityStatusMiddleware,
  ActivityStatusRenderer,
  AttachmentForScreenReaderComponentFactory,
  AttachmentForScreenReaderMiddleware,
  /** @deprecated Use `polymiddleware` instead, this will be removed on or after 2027-08-16. */
  LegacyAttachmentMiddleware as AttachmentMiddleware,
  AvatarComponentFactory,
  AvatarMiddleware,
  CardActionMiddleware,
  ComposerProps,
  ComposerCoreChildrenRenderProp,
  ContextOf,
  DebouncedNotification,
  DebouncedNotifications,
  GroupActivities,
  GroupActivitiesMiddleware,
  Notification,
  PerformCardAction,
  PostActivityFile,
  RenderActivityStatus,
  LegacyRenderAttachment as RenderAttachment,
  RenderToast,
  RenderTypingIndicator,
  ScrollToEndButtonComponentFactory,
  ScrollToEndButtonMiddleware,
  SendStatus,
  StrictStyleOptions,
  StyleOptions,
  ToastMiddleware,
  Typing,
  TypingIndicatorMiddleware,
  WebSpeechPonyfill,
  WebSpeechPonyfillFactory
};

// #region Build info
import buildInfo from './buildInfo';

const { object: buildInfoObject, version } = buildInfo;

export { buildInfoObject as buildInfo, version };
// #endregion
