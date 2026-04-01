const VOICE_SET_STATE = 'WEB_CHAT/VOICE_SET_STATE' as const;

type VoiceState = 'idle' | 'listening' | 'user_speaking' | 'processing' | 'bot_speaking';

type VoiceSetStateAction = {
  type: typeof VOICE_SET_STATE;
  payload: { voiceState: VoiceState };
};

function setVoiceState(voiceState: VoiceState): VoiceSetStateAction {
  return {
    type: VOICE_SET_STATE,
    payload: { voiceState }
  };
}

export default setVoiceState;

export { VOICE_SET_STATE };

export type { VoiceState, VoiceSetStateAction };
