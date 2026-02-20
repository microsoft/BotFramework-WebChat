const VOICE_UNMUTE_RECORDING = 'WEB_CHAT/VOICE_UNMUTE_RECORDING' as const;

type VoiceUnmuteRecordingAction = {
  type: typeof VOICE_UNMUTE_RECORDING;
};

function unmuteVoiceRecording(): VoiceUnmuteRecordingAction {
  return {
    type: VOICE_UNMUTE_RECORDING
  };
}

export default unmuteVoiceRecording;

export { VOICE_UNMUTE_RECORDING };

export type { VoiceUnmuteRecordingAction };
