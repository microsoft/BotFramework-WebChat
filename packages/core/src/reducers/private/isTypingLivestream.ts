import { type WebChatActivity } from '../../types/WebChatActivity';

export default function isTypingLivestream(
  activity: WebChatActivity
): activity is WebChatActivity & { text: string; type: 'typing' } {
  return activity.type === 'typing' && 'text' in activity && typeof activity.text === 'string';
}
