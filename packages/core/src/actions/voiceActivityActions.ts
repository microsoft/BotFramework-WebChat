import type { WebChatActivity } from '../types/WebChatActivity';

const VOICE_START_RECORDING = 'WEB_CHAT/VOICE_START_RECORDING' as const;
const VOICE_STOP_RECORDING = 'WEB_CHAT/VOICE_STOP_RECORDING' as const;
const VOICE_SET_STATE = 'WEB_CHAT/VOICE_SET_STATE' as const;
const VOICE_REGISTER_HANDLER = 'WEB_CHAT/VOICE_REGISTER_HANDLER' as const;
const VOICE_POST_ACTIVITY = 'WEB_CHAT/VOICE_POST_ACTIVITY' as const;

type SpeechState = 'idle' | 'listening' | 'user_speaking' | 'processing' | 'bot_speaking';
type VoiceHandler = {
  playAudio: (base64: string) => void;
  stopAudio: () => void;
} | null;

type VoiceStartRecordingAction = {
  type: typeof VOICE_START_RECORDING;
};

type VoiceStopRecordingAction = {
  type: typeof VOICE_STOP_RECORDING;
};

type VoiceSetStateAction = {
  type: typeof VOICE_SET_STATE;
  payload: { speechState: SpeechState };
};

type VoiceRegisterHandlerAction = {
  type: typeof VOICE_REGISTER_HANDLER;
  payload: { voiceHandler: VoiceHandler };
};

type VoicePostActivityAction = {
  type: typeof VOICE_POST_ACTIVITY;
  payload: { activity: WebChatActivity };
};

type VoiceActivityActions =
  | VoiceStartRecordingAction
  | VoiceStopRecordingAction
  | VoiceSetStateAction
  | VoiceRegisterHandlerAction
  | VoicePostActivityAction;

function startVoiceRecording(): VoiceStartRecordingAction {
  return {
    type: VOICE_START_RECORDING
  };
}

function stopVoiceRecording(): VoiceStopRecordingAction {
  return {
    type: VOICE_STOP_RECORDING
  };
}

function setVoiceState(speechState: SpeechState): VoiceSetStateAction {
  return {
    type: VOICE_SET_STATE,
    payload: { speechState }
  };
}

function registerVoiceHandler(voiceHandler: VoiceHandler): VoiceRegisterHandlerAction {
  return {
    type: VOICE_REGISTER_HANDLER,
    payload: { voiceHandler }
  };
}

function postVoiceActivity(activity: WebChatActivity): VoicePostActivityAction {
  return {
    type: VOICE_POST_ACTIVITY,
    payload: { activity }
  };
}

export {
  VOICE_START_RECORDING,
  VOICE_STOP_RECORDING,
  VOICE_SET_STATE,
  VOICE_REGISTER_HANDLER,
  VOICE_POST_ACTIVITY,
  startVoiceRecording,
  stopVoiceRecording,
  setVoiceState,
  registerVoiceHandler,
  postVoiceActivity
};

export type {
  SpeechState,
  VoiceHandler,
  VoiceActivityActions,
  VoiceStartRecordingAction,
  VoiceStopRecordingAction,
  VoiceSetStateAction,
  VoiceRegisterHandlerAction,
  VoicePostActivityAction
};
