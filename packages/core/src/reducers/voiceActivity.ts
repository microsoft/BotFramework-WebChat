import { VOICE_MUTE_RECORDING } from '../actions/muteVoiceRecording';
import { VOICE_REGISTER_HANDLER } from '../actions/registerVoiceHandler';
import { VOICE_SET_STATE } from '../actions/setVoiceState';
import { VOICE_START_RECORDING } from '../actions/startVoiceRecording';
import { VOICE_STOP_RECORDING } from '../actions/stopVoiceRecording';
import { VOICE_UNMUTE_RECORDING } from '../actions/unmuteVoiceRecording';
import { VOICE_UNREGISTER_HANDLER } from '../actions/unregisterVoiceHandler';

import nextVoiceState from '../services/private/nextVoiceState';

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
  microphoneMuted: boolean;
  voiceState: VoiceState;
  voiceHandlers: Map<string, VoiceHandler>;
}

const DEFAULT_STATE: VoiceActivityState = {
  microphoneMuted: false,
  voiceState: 'idle',
  voiceHandlers: new Map()
};

export default function voiceActivity(
  state: VoiceActivityState = DEFAULT_STATE,
  action: VoiceActivityActions
): VoiceActivityState {
  switch (action.type) {
    case VOICE_MUTE_RECORDING:
      return nextVoiceState(state, { type: 'mute' });

    case VOICE_REGISTER_HANDLER:
      return nextVoiceState(state, {
        id: action.payload.id,
        type: 'register',
        voiceHandler: action.payload.voiceHandler
      });

    case VOICE_UNREGISTER_HANDLER:
      return nextVoiceState(state, { id: action.payload.id, type: 'unregister' });

    case VOICE_SET_STATE:
      return nextVoiceState(state, { type: 'setState', voiceState: action.payload.voiceState });

    case VOICE_START_RECORDING:
      return nextVoiceState(state, { type: 'start' });

    case VOICE_STOP_RECORDING:
      return nextVoiceState(state, { type: 'stop' });

    case VOICE_UNMUTE_RECORDING:
      return nextVoiceState(state, { type: 'unmute' });

    default:
      return state;
  }
}

export type { VoiceActivityState };
