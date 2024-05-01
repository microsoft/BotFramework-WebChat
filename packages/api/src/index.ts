import StyleOptions, { StrictStyleOptions } from './StyleOptions';
import defaultStyleOptions from './defaultStyleOptions';
import Composer, { ComposerProps } from './hooks/Composer';
import * as hooks from './hooks/index';
import {
  SendBoxMiddlewareProxy,
  rectifySendBoxMiddlewareProps,
  type SendBoxMiddleware,
  type SendBoxMiddlewareProps,
  type SendBoxMiddlewareRequest
} from './hooks/internal/SendBoxMiddleware';
import {
  SendBoxToolbarMiddlewareProxy,
  rectifySendBoxToolbarMiddlewareProps,
  type SendBoxToolbarMiddleware,
  type SendBoxToolbarMiddlewareProps,
  type SendBoxToolbarMiddlewareRequest
} from './hooks/internal/SendBoxToolbarMiddleware';
import concatMiddleware from './hooks/middleware/concatMiddleware';
import { type ActivityStatusRenderer } from './hooks/useCreateActivityStatusRenderer'; // TODO: [P1] This line should export the one from the version from "middleware rework" workstream.
import { type DebouncedNotification, type DebouncedNotifications } from './hooks/useDebouncedNotifications';
import { type PostActivityFile } from './hooks/useSendFiles';
import { localize } from './localization/Localize';
import normalizeStyleOptions from './normalizeStyleOptions';
import ActivityMiddleware, { type ActivityComponentFactory } from './types/ActivityMiddleware';
import { type ActivityStatusMiddleware, type RenderActivityStatus } from './types/ActivityStatusMiddleware';
import AttachmentForScreenReaderMiddleware, {
  AttachmentForScreenReaderComponentFactory
} from './types/AttachmentForScreenReaderMiddleware';
import AttachmentMiddleware, { type RenderAttachment } from './types/AttachmentMiddleware';
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

const buildTool = process.env.build_tool;
const moduleFormat = process.env.module_format;
const version = process.env.npm_package_version;

const buildInfo = { buildTool, moduleFormat, version };

export {
  Composer,
  SendBoxMiddlewareProxy,
  SendBoxToolbarMiddlewareProxy,
  buildInfo,
  concatMiddleware,
  defaultStyleOptions,
  hooks,
  localize,
  normalizeStyleOptions,
  rectifySendBoxMiddlewareProps,
  rectifySendBoxToolbarMiddlewareProps,
  version
};

export type {
  ActivityComponentFactory,
  ActivityMiddleware,
  ActivityStatusMiddleware,
  ActivityStatusRenderer,
  AttachmentForScreenReaderComponentFactory,
  AttachmentForScreenReaderMiddleware,
  AttachmentMiddleware,
  AvatarComponentFactory,
  AvatarMiddleware,
  CardActionMiddleware,
  ComposerProps,
  ContextOf,
  DebouncedNotification,
  DebouncedNotifications,
  GroupActivities,
  GroupActivitiesMiddleware,
  Notification,
  PerformCardAction,
  PostActivityFile,
  RenderActivityStatus,
  RenderAttachment,
  RenderToast,
  RenderTypingIndicator,
  ScrollToEndButtonComponentFactory,
  ScrollToEndButtonMiddleware,
  SendBoxMiddleware,
  SendBoxMiddlewareProps,
  SendBoxMiddlewareRequest,
  SendBoxToolbarMiddleware,
  SendBoxToolbarMiddlewareProps,
  SendBoxToolbarMiddlewareRequest,
  SendStatus,
  StrictStyleOptions,
  StyleOptions,
  ToastMiddleware,
  Typing,
  TypingIndicatorMiddleware,
  WebSpeechPonyfill,
  WebSpeechPonyfillFactory
};
