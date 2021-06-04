import ActivityMiddleware from './types/ActivityMiddleware';
import AttachmentMiddleware from './types/AttachmentMiddleware';
import AttachmentForScreenReaderMiddleware from './types/AttachmentForScreenReaderMiddleware';
import GroupActivitiesMiddleware from './types/GroupActivitiesMiddleware';
import ScrollToEndButtonMiddleware from './types/ScrollToEndButtonMiddleware';
import StyleOptions, { StrictStyleOptions } from './StyleOptions';

declare const defaultStyleOptions: Required<StyleOptions>;

// TODO: [P2] ESLint of DLSpeech SDK should ignore this file since its from API.
// eslint-disable-next-line no-unused-vars
declare function normalizeStyleOptions(styleOptions: StyleOptions): StrictStyleOptions;

export type {
  ActivityMiddleware,
  AttachmentMiddleware,
  AttachmentForScreenReaderMiddleware,
  GroupActivitiesMiddleware,
  ScrollToEndButtonMiddleware,
  StrictStyleOptions,
  StyleOptions
};

export { defaultStyleOptions, normalizeStyleOptions };
