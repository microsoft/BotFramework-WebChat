import StyleOptions, { StrictStyleOptions } from './StyleOptions';
import defaultStyleOptions from './defaultStyleOptions';
import * as hooks from './hooks';
import Composer, { ComposerProps } from './hooks/Composer';
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
import { localize } from './localization/Localize';
import normalizeStyleOptions from './normalizeStyleOptions';
import ActivityMiddleware, { ActivityComponentFactory } from './types/ActivityMiddleware';
import { type ActivityStatusMiddleware, type RenderActivityStatus } from './types/ActivityStatusMiddleware';
import AttachmentForScreenReaderMiddleware, {
  AttachmentForScreenReaderComponentFactory
} from './types/AttachmentForScreenReaderMiddleware';
import AttachmentMiddleware, { RenderAttachment } from './types/AttachmentMiddleware';
import AvatarMiddleware, { AvatarComponentFactory } from './types/AvatarMiddleware';
import CardActionMiddleware, { PerformCardAction } from './types/CardActionMiddleware';
import GroupActivitiesMiddleware, { GroupActivities } from './types/GroupActivitiesMiddleware';
import ScrollToEndButtonMiddleware, { ScrollToEndButtonComponentFactory } from './types/ScrollToEndButtonMiddleware';
import ToastMiddleware, { RenderToast } from './types/ToastMiddleware';
import TypingIndicatorMiddleware, { RenderTypingIndicator } from './types/TypingIndicatorMiddleware';
import WebSpeechPonyfill from './types/WebSpeechPonyfill';
import WebSpeechPonyfillFactory from './types/WebSpeechPonyfillFactory';

export {
  Composer,
  SendBoxMiddlewareProxy,
  SendBoxToolbarMiddlewareProxy,
  concatMiddleware,
  defaultStyleOptions,
  hooks,
  localize,
  normalizeStyleOptions,
  rectifySendBoxMiddlewareProps,
  rectifySendBoxToolbarMiddlewareProps
};

export type {
  ActivityComponentFactory,
  ActivityMiddleware,
  ActivityStatusMiddleware,
  AttachmentForScreenReaderComponentFactory,
  AttachmentForScreenReaderMiddleware,
  AttachmentMiddleware,
  AvatarComponentFactory,
  AvatarMiddleware,
  CardActionMiddleware,
  ComposerProps,
  GroupActivities,
  GroupActivitiesMiddleware,
  PerformCardAction,
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
  StrictStyleOptions,
  StyleOptions,
  ToastMiddleware,
  TypingIndicatorMiddleware,
  WebSpeechPonyfill,
  WebSpeechPonyfillFactory
};
