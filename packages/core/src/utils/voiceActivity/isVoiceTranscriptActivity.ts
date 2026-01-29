import { check, literal, object, picklist, pipe, safeParse, string } from 'valibot';

import { WebChatActivity } from '../../types/WebChatActivity';

// valueType: contains 'audio.transcript' (e.g., azure.directline.audio.transcript)
const VoiceTranscriptActivitySchema = object({
  name: literal('media.end'),
  type: literal('event'),
  value: object({
    origin: picklist(['agent', 'user']),
    transcription: string()
  }),
  valueType: pipe(
    string(),
    check(value => value.includes('audio.transcript'))
  )
});

const isVoiceTranscriptActivity = (
  activity: WebChatActivity
): activity is WebChatActivity & {
  value: {
    origin: 'agent' | 'user';
    transcription: string;
  };
  valueType: string;
} => safeParse(VoiceTranscriptActivitySchema, activity).success;

export default isVoiceTranscriptActivity;
