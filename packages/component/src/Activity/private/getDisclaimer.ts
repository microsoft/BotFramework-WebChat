import { type WebChatActivity } from 'botframework-webchat-core';
import hasFeedbackLoop from './hasFeedbackLoop';

export default function getDisclaimer(activity: WebChatActivity): string | undefined {
  return hasFeedbackLoop(activity) ? activity.channelData.feedbackLoop.disclaimer : undefined;
}
