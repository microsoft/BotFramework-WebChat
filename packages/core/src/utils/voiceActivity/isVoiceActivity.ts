import { WebChatActivity } from '../../types/WebChatActivity';

// This is interim type guard until activity protocol is ratified.
const isVoiceActivity = (
  activity: WebChatActivity
): activity is WebChatActivity & {
  value: { voiceLiveEvent: any };
} =>
  activity.type === 'event' &&
  activity.value &&
  typeof activity.value === 'object' &&
  'voiceLiveEvent' in activity.value;

export default isVoiceActivity;
