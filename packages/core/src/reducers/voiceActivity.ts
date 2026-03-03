import { VOICE_MUTE_RECORDING } from '../actions/muteVoiceRecording';
import { VOICE_REGISTER_HANDLER } from '../actions/registerVoiceHandler';
import { VOICE_SET_STATE } from '../actions/setVoiceState';
import { VOICE_START_RECORDING } from '../actions/startVoiceRecording';
import { VOICE_STOP_RECORDING } from '../actions/stopVoiceRecording';
import { VOICE_UNMUTE_RECORDING } from '../actions/unmuteVoiceRecording';
import { VOICE_UNREGISTER_HANDLER } from '../actions/unregisterVoiceHandler';

import type { VoiceMuteRecordingAction } from '../actions/muteVoiceRecording';
import type { VoiceHandler, VoiceRegisterHandlerAction } from '../actions/registerVoiceHandler';
import type { VoiceSetStateAction, VoiceState } from '../actions/setVoiceState';
import type { VoiceStartRecordingAction } from '../actions/startVoiceRecording';
import type { VoiceStopRecordingAction } from '../actions/stopVoiceRecording';
import type { VoiceUnmuteRecordingAction } from '../actions/unmuteVoiceRecording';
import type { VoiceUnregisterHandlerAction } from '../actions/unregisterVoiceHandler';

type VoiceActivityActions =
  | VoiceMuteRecordingAction
  | VoiceRegisterHandlerAction
  | VoiceSetStateAction
  | VoiceStartRecordingAction
  | VoiceStopRecordingAction
  | VoiceUnmuteRecordingAction
  | VoiceUnregisterHandlerAction;

interface VoiceActivityState {
  voiceState: VoiceState;
  voiceHandlers: Map<string, VoiceHandler>;
}

const DEFAULT_STATE: VoiceActivityState = {
  voiceState: 'idle',
  voiceHandlers: new Map()
};

export default function voiceActivity(
  state: VoiceActivityState = DEFAULT_STATE,
  action: VoiceActivityActions
): VoiceActivityState {
  switch (action.type) {
    case VOICE_MUTE_RECORDING:
      // Only allow muting when in listening state
      if (state.voiceState !== 'listening') {
        console.warn(`botframework-webchat: Cannot mute from "${state.voiceState}" state, must be "listening"`);
        return state;
      }

      return {
        ...state,
        voiceState: 'muted'
      };

    case VOICE_REGISTER_HANDLER: {
      const newHandlers = new Map(state.voiceHandlers);
      newHandlers.set(action.payload.id, action.payload.voiceHandler);
      return {
        ...state,
        voiceHandlers: newHandlers
      };
    }

    case VOICE_UNREGISTER_HANDLER: {
      const newHandlers = new Map(state.voiceHandlers);
      newHandlers.delete(action.payload.id);
      return {
        ...state,
        voiceHandlers: newHandlers
      };
    }

    case VOICE_SET_STATE:
      return {
        ...state,
        voiceState: action.payload.voiceState
      };

    case VOICE_START_RECORDING:
      if (state.voiceState !== 'idle') {
        console.warn(`botframework-webchat: Should not transit from "${state.voiceState}" to "listening"`);
      }

      return {
        ...state,
        voiceState: 'listening'
      };

    case VOICE_STOP_RECORDING:
      return {
        ...state,
        voiceState: 'idle'
      };

    case VOICE_UNMUTE_RECORDING:
      if (state.voiceState !== 'muted') {
        console.warn(`botframework-webchat: Should not transit from "${state.voiceState}" to "listening"`);
      }

      return {
        ...state,
        voiceState: 'listening'
      };

    default:
      return state;
  }
}

export type { VoiceActivityState };
