import StyleOptions, { StrictStyleOptions } from './StyleOptions';
import defaultStyleOptions from './defaultStyleOptions';
import * as hooks from './hooks';
import Composer, { ComposerProps } from './hooks/Composer';
import concatMiddleware from './hooks/middleware/concatMiddleware';
import { localize } from './localization/Localize';
import normalizeStyleOptions from './normalizeStyleOptions';
import ActivityMiddleware, { ActivityComponentFactory } from './types/ActivityMiddleware';
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

import type { ActivityStatusMiddleware, RenderActivityStatus } from './types/ActivityStatusMiddleware';

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
