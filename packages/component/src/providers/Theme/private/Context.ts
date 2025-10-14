import type {
  ActivityMiddleware,
  ActivityStatusMiddleware,
  AttachmentForScreenReaderMiddleware,
  AttachmentMiddleware,
  AvatarMiddleware,
  CardActionMiddleware,
  GroupActivitiesMiddleware,
  ScrollToEndButtonMiddleware,
  SendBoxMiddleware,
  SendBoxToolbarMiddleware,
  ToastMiddleware,
  TypingIndicatorMiddleware
} from 'botframework-webchat-api';
import { type Polymiddleware } from 'botframework-webchat-api/middleware';
import { createContext } from 'react';

const EMPTY_ARRAY = Object.freeze([] as const);

export type ThemeContextType = {
  /** @deprecated Use `polymiddleware` instead, this will be removed on or after 2027-08-16. */
  readonly activityMiddleware: readonly ActivityMiddleware[];
  readonly activityStatusMiddleware: readonly ActivityStatusMiddleware[];
  readonly attachmentForScreenReaderMiddleware: readonly AttachmentForScreenReaderMiddleware[];
  readonly attachmentMiddleware: readonly AttachmentMiddleware[];
  readonly avatarMiddleware: readonly AvatarMiddleware[];
  readonly cardActionMiddleware: readonly CardActionMiddleware[];
  readonly groupActivitiesMiddleware: readonly GroupActivitiesMiddleware[];
  readonly polymiddleware: readonly Polymiddleware[];
  readonly scrollToEndButtonMiddleware: readonly ScrollToEndButtonMiddleware[];
  readonly sendBoxMiddleware: readonly SendBoxMiddleware[];
  readonly sendBoxToolbarMiddleware: readonly SendBoxToolbarMiddleware[];
  readonly toastMiddleware: readonly ToastMiddleware[];
  readonly typingIndicatorMiddleware: readonly TypingIndicatorMiddleware[];
};

export default createContext<ThemeContextType>({
  activityMiddleware: EMPTY_ARRAY,
  activityStatusMiddleware: EMPTY_ARRAY,
  attachmentForScreenReaderMiddleware: EMPTY_ARRAY,
  attachmentMiddleware: EMPTY_ARRAY,
  avatarMiddleware: EMPTY_ARRAY,
  cardActionMiddleware: EMPTY_ARRAY,
  groupActivitiesMiddleware: EMPTY_ARRAY,
  polymiddleware: EMPTY_ARRAY,
  scrollToEndButtonMiddleware: EMPTY_ARRAY,
  sendBoxMiddleware: EMPTY_ARRAY,
  sendBoxToolbarMiddleware: EMPTY_ARRAY,
  toastMiddleware: EMPTY_ARRAY,
  typingIndicatorMiddleware: EMPTY_ARRAY
});
