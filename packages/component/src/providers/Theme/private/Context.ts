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
  StyleOptions,
  ToastMiddleware,
  TypingIndicatorMiddleware
} from 'botframework-webchat-api';
import { createContext } from 'react';

const EMPTY_ARRAY = Object.freeze([] as const);
const EMPTY_OBJECT = Object.freeze({} as const);

export type ContextType = {
  activityMiddleware: readonly ActivityMiddleware[];
  activityStatusMiddleware: readonly ActivityStatusMiddleware[];
  attachmentForScreenReaderMiddleware: readonly AttachmentForScreenReaderMiddleware[];
  attachmentMiddleware: readonly AttachmentMiddleware[];
  avatarMiddleware: readonly AvatarMiddleware[];
  cardActionMiddleware: readonly CardActionMiddleware[];
  groupActivitiesMiddleware: readonly GroupActivitiesMiddleware[];
  scrollToEndButtonMiddleware: readonly ScrollToEndButtonMiddleware[];
  sendBoxMiddleware: readonly SendBoxMiddleware[];
  sendBoxToolbarMiddleware: readonly SendBoxToolbarMiddleware[];
  styleOptions: StyleOptions;
  toastMiddleware: readonly ToastMiddleware[];
  typingIndicatorMiddleware: readonly TypingIndicatorMiddleware[];
};

export default createContext<ContextType>({
  activityMiddleware: EMPTY_ARRAY,
  activityStatusMiddleware: EMPTY_ARRAY,
  attachmentForScreenReaderMiddleware: EMPTY_ARRAY,
  attachmentMiddleware: EMPTY_ARRAY,
  avatarMiddleware: EMPTY_ARRAY,
  cardActionMiddleware: EMPTY_ARRAY,
  groupActivitiesMiddleware: EMPTY_ARRAY,
  scrollToEndButtonMiddleware: EMPTY_ARRAY,
  sendBoxMiddleware: EMPTY_ARRAY,
  sendBoxToolbarMiddleware: EMPTY_ARRAY,
  styleOptions: EMPTY_OBJECT,
  toastMiddleware: EMPTY_ARRAY,
  typingIndicatorMiddleware: EMPTY_ARRAY
});
