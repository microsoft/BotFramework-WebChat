import { check, is, literal, object, picklist, pipe, string, type InferOutput } from 'valibot';

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
): activity is WebChatActivity & InferOutput<typeof VoiceTranscriptActivitySchema> =>
  is(VoiceTranscriptActivitySchema, activity);

export default isVoiceTranscriptActivity;
