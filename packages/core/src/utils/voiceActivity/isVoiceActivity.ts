import { WebChatActivity } from '../../types/WebChatActivity';

// This is interim until activity protocol is ratified.
const isVoiceActivity = (
  activity: WebChatActivity
): activity is WebChatActivity & {
  name: string;
  type: 'event';
  value: { voice: any };
} =>
  activity.type === 'event' &&
  !!activity.name &&
  !!activity.value &&
  typeof activity.value === 'object' &&
  'voice' in activity.value;

export default isVoiceActivity;
