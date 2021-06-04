export * as hooks from './hooks';

import ActivityMiddleware from './types/ActivityMiddleware';
import ActivityStatusMiddleware from './types/ActivityStatusMiddleware';
import AttachmentForScreenReaderMiddleware from './types/AttachmentForScreenReaderMiddleware';
import AttachmentMiddleware from './types/AttachmentMiddleware';
import AvatarMiddleware from './types/AvatarMiddleware';
import GroupActivitiesMiddleware from './types/GroupActivitiesMiddleware';
import ScrollToEndButtonMiddleware from './types/ScrollToEndButtonMiddleware';
import StyleOptions, { StrictStyleOptions } from './StyleOptions';
import ToastMiddleware from './types/ToastMiddleware';
import TypingIndicatorMiddleware from './types/TypingIndicatorMiddleware';

declare const defaultStyleOptions: Required<StyleOptions>;

// TODO: [P2] ESLint of DLSpeech SDK should ignore this file since its from API.
// eslint-disable-next-line no-unused-vars
declare function normalizeStyleOptions(styleOptions: StyleOptions): StrictStyleOptions;

export type {
  ActivityMiddleware,
  ActivityStatusMiddleware,
  AttachmentForScreenReaderMiddleware,
  AttachmentMiddleware,
  AvatarMiddleware,
  GroupActivitiesMiddleware,
  ScrollToEndButtonMiddleware,
  StrictStyleOptions,
  StyleOptions,
  ToastMiddleware,
  TypingIndicatorMiddleware
};

export { defaultStyleOptions, normalizeStyleOptions };
