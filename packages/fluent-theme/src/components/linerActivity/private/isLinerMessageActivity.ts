import { type WebChatActivity } from 'botframework-webchat/internal';

export default function isLinerMessageActivity(
  activity: undefined | WebChatActivity
): activity is WebChatActivity & { type: 'message'; from: { role: 'channel' } } {
  return !!(activity && activity.from.role === 'channel' && activity.type === 'message' && 'text' in activity);
}
