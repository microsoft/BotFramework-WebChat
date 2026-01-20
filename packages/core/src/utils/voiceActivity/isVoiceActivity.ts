import { WebChatActivity } from '../../types/WebChatActivity';

// This is interim until activity protocol is ratified.
// all voice and dtmf activities are considered voice activities.
const isVoiceActivity = (
  activity: WebChatActivity
): activity is WebChatActivity & {
  name: string;
  type: 'event';
  payload: { voice: any };
} =>
  activity.type === 'event' &&
  !!activity.name &&
  !!activity.payload &&
  typeof activity.payload === 'object' &&
  ('voice' in activity.payload || 'dtmf' in activity.payload);

export default isVoiceActivity;
