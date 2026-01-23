const VOICE_START_RECORDING = 'WEB_CHAT/VOICE_START_RECORDING' as const;

type VoiceStartRecordingAction = {
  type: typeof VOICE_START_RECORDING;
};

function startVoiceRecording(): VoiceStartRecordingAction {
  return {
    type: VOICE_START_RECORDING
  };
}

export default startVoiceRecording;

export { VOICE_START_RECORDING };

export type { VoiceStartRecordingAction };
