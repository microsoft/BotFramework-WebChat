import {
  VOICE_START_RECORDING,
  VOICE_STOP_RECORDING,
  VOICE_SET_STATE,
  VOICE_REGISTER_HANDLER
} from '../actions/voiceActivityActions';

import type { SpeechState, VoiceHandler, VoiceActivityActions } from '../actions/voiceActivityActions';

interface VoiceState {
  recording: boolean;
  speechState: SpeechState;
  voiceHandler: VoiceHandler;
}

const DEFAULT_STATE: VoiceState = {
  recording: false,
  speechState: 'idle',
  voiceHandler: null
};

export default function voice(state: VoiceState = DEFAULT_STATE, action: VoiceActivityActions): VoiceState {
  switch (action.type) {
    case VOICE_START_RECORDING:
      return {
        ...state,
        recording: true,
        speechState: 'listening'
      };

    case VOICE_STOP_RECORDING:
      return {
        ...state,
        recording: false,
        speechState: 'idle'
      };

    case VOICE_SET_STATE:
      return {
        ...state,
        speechState: action.payload.speechState
      };

    case VOICE_REGISTER_HANDLER:
      return {
        ...state,
        voiceHandler: action.payload.voiceHandler
      };

    default:
      return state;
  }
}

export type { VoiceState };
