import { type WebChatActivity } from 'botframework-webchat-core';
import { hasDisclaimer } from './hasFeedbackLoop';

export default function getDisclaimer(activity: WebChatActivity): string | undefined {
  return hasDisclaimer(activity) ? activity.channelData.feedbackLoop.disclaimer : undefined;
}
