import type { WebChatActivity } from '../types/WebChatActivity';

const VOICE_POST_ACTIVITY = 'WEB_CHAT/VOICE_POST_ACTIVITY' as const;

type VoicePostActivityAction = {
  type: typeof VOICE_POST_ACTIVITY;
  payload: { activity: WebChatActivity };
};

function postVoiceActivity(activity: WebChatActivity): VoicePostActivityAction {
  return {
    type: VOICE_POST_ACTIVITY,
    payload: { activity }
  };
}

export default postVoiceActivity;

export { VOICE_POST_ACTIVITY };

export type { VoicePostActivityAction };
