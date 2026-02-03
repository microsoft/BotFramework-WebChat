const VOICE_STOP_RECORDING = 'WEB_CHAT/VOICE_STOP_RECORDING' as const;

type VoiceStopRecordingAction = {
  type: typeof VOICE_STOP_RECORDING;
};

function stopVoiceRecording(): VoiceStopRecordingAction {
  return {
    type: VOICE_STOP_RECORDING
  };
}

export default stopVoiceRecording;

export { VOICE_STOP_RECORDING };

export type { VoiceStopRecordingAction };
