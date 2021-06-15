import * as hooks from './hooks';
import ActivityMiddleware, { ActivityComponentFactory } from './types/ActivityMiddleware';
import ActivityStatusMiddleware, { RenderActivityStatus } from './types/ActivityStatusMiddleware';
import AttachmentForScreenReaderMiddleware, {
  AttachmentForScreenReaderComponentFactory
} from './types/AttachmentForScreenReaderMiddleware';
import AttachmentMiddleware, { RenderAttachment } from './types/AttachmentMiddleware';
import AvatarMiddleware, { AvatarComponentFactory } from './types/AvatarMiddleware';
import CardActionMiddleware, { PerformCardAction } from './types/CardActionMiddleware';
import Composer, { ComposerProps } from './hooks/Composer';
import concatMiddleware from './hooks/middleware/concatMiddleware';
import defaultStyleOptions from './defaultStyleOptions';
import GroupActivitiesMiddleware, { GroupActivities } from './types/GroupActivitiesMiddleware';
import Localize, { localize } from './localization/Localize';
import normalizeStyleOptions from './normalizeStyleOptions';
import ScrollToEndButtonMiddleware, { ScrollToEndButtonComponentFactory } from './types/ScrollToEndButtonMiddleware';
import StyleOptions, { StrictStyleOptions } from './StyleOptions';
import ToastMiddleware, { RenderToast } from './types/ToastMiddleware';
import TypingIndicatorMiddleware, { RenderTypingIndicator } from './types/TypingIndicatorMiddleware';
import WebSpeechPonyfill from './types/WebSpeechPonyfill';
import WebSpeechPonyfillFactory from './types/WebSpeechPonyfillFactory';

export { Composer, concatMiddleware, defaultStyleOptions, hooks, Localize, localize, normalizeStyleOptions };

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
