import { type WebChatActivity } from 'botframework-webchat-core';

import { hasDisclaimer } from './hasFeedbackLoop';

/**
 * @deprecated This helper function should only use for patching the service. After patching, should use `getDisclaimerFromReviewAction` instead.
 */
export default function getDisclaimer(activity: WebChatActivity): string | undefined {
  return hasDisclaimer(activity) ? activity.channelData.feedbackLoop.disclaimer : undefined;
}
