import { check, literal, looseObject, object, pipe, safeParse, string } from 'valibot';

import { WebChatActivity } from '../../types/WebChatActivity';

// Activity spec proposal - https://github.com/microsoft/Agents/issues/416
// valueType: contains 'audio' or 'dtmf' (works with any server prefix like azure.directline, ccv2, etc.)
const VoiceActivitySchema = object({
  name: string(),
  type: literal('event'),
  value: looseObject({}),
  valueType: pipe(
    string(),
    check(value => value.includes('audio') || value.includes('dtmf'))
  )
});

const isVoiceActivity = (
  activity: WebChatActivity
): activity is WebChatActivity & {
  name: string;
  type: 'event';
  value: any;
  valueType: string;
} => safeParse(VoiceActivitySchema, activity).success;

export default isVoiceActivity;
