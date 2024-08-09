import type { WebChatActivity } from 'botframework-webchat-core';
import getMessageEntity from '../../utils/getMessageEntity';

export default function isPreChatMessageActivity(
  activity: undefined | WebChatActivity
): activity is WebChatActivity & { type: 'message' } {
  return !!(activity && getMessageEntity(activity)?.keywords.includes('PreChatMessage'));
}
