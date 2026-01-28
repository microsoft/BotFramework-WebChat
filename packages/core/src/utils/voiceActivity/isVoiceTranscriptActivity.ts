import { literal, object, picklist, safeParse, string } from 'valibot';

import { WebChatActivity } from '../../types/WebChatActivity';

const VoiceTranscriptActivitySchema = object({
  name: literal('stream.end'),
  payload: object({
    voice: object({
      origin: picklist(['agent', 'user']),
      transcription: string()
    })
  }),
  type: literal('event')
});

const isVoiceTranscriptActivity = (
  activity: WebChatActivity
): activity is WebChatActivity & {
  payload: {
    voice: {
      origin: 'agent' | 'user';
      transcription: string;
    };
  };
} => safeParse(VoiceTranscriptActivitySchema, activity).success;

export default isVoiceTranscriptActivity;
