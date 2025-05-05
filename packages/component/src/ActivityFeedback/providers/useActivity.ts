import { type WebChatActivity } from 'botframework-webchat-core';
import useActivityFeedbackContext from './private/useActivityFeedbackContext';

export default function useActivity(): readonly [WebChatActivity] {
  return useActivityFeedbackContext().activityState;
}
