import { any, literal, object, safeParse, string, union } from 'valibot';

import { WebChatActivity } from '../../types/WebChatActivity';

// This is interim until activity protocol is ratified.
// all voice and dtmf activities are considered voice activities.
const VoiceActivitySchema = object({
  name: string(),
  payload: union([
    object({
      voice: any()
    }),
    object({
      dtmf: any()
    })
  ]),
  type: literal('event')
});

const isVoiceActivity = (
  activity: WebChatActivity
): activity is WebChatActivity & {
  name: string;
  type: 'event';
  payload: { voice: any };
} => safeParse(VoiceActivitySchema, activity).success;

export default isVoiceActivity;
