import { localize } from './localization/Localize';
import * as hooks from './hooks';
import { type ActivityComponentFactory } from './types/ActivityMiddleware';
import type ActivityMiddleware from './types/ActivityMiddleware';
import { type AttachmentForScreenReaderComponentFactory } from './types/AttachmentForScreenReaderMiddleware';
import type AttachmentForScreenReaderMiddleware from './types/AttachmentForScreenReaderMiddleware';
import { type RenderAttachment } from './types/AttachmentMiddleware';
import type AttachmentMiddleware from './types/AttachmentMiddleware';
import { type AvatarComponentFactory } from './types/AvatarMiddleware';
import type AvatarMiddleware from './types/AvatarMiddleware';
import { type PerformCardAction } from './types/CardActionMiddleware';
import type CardActionMiddleware from './types/CardActionMiddleware';
import Composer, { type ComposerProps } from './hooks/Composer';
import concatMiddleware from './hooks/middleware/concatMiddleware';
import defaultStyleOptions from './defaultStyleOptions';
import { type GroupActivities } from './types/GroupActivitiesMiddleware';
import type GroupActivitiesMiddleware from './types/GroupActivitiesMiddleware';
import normalizeStyleOptions from './normalizeStyleOptions';
import { type ScrollToEndButtonComponentFactory } from './types/ScrollToEndButtonMiddleware';
import type ScrollToEndButtonMiddleware from './types/ScrollToEndButtonMiddleware';
import { type StrictStyleOptions } from './StyleOptions';
import type StyleOptions from './StyleOptions';
import { type RenderToast } from './types/ToastMiddleware';
import type ToastMiddleware from './types/ToastMiddleware';
import { type RenderTypingIndicator } from './types/TypingIndicatorMiddleware';
import type TypingIndicatorMiddleware from './types/TypingIndicatorMiddleware';
import type WebSpeechPonyfill from './types/WebSpeechPonyfill';
import type WebSpeechPonyfillFactory from './types/WebSpeechPonyfillFactory';

import { type ActivityStatusMiddleware, type RenderActivityStatus } from './types/ActivityStatusMiddleware';

export { Composer, concatMiddleware, defaultStyleOptions, hooks, localize, normalizeStyleOptions };

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
  StrictStyleOptions,
  StyleOptions,
  ToastMiddleware,
  TypingIndicatorMiddleware,
  WebSpeechPonyfill,
  WebSpeechPonyfillFactory
};
