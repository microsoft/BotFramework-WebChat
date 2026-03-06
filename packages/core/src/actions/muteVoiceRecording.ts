const VOICE_MUTE_RECORDING = 'WEB_CHAT/VOICE_MUTE_RECORDING' as const;

type VoiceMuteRecordingAction = {
  type: typeof VOICE_MUTE_RECORDING;
};

function muteVoiceRecording(): VoiceMuteRecordingAction {
  return {
    type: VOICE_MUTE_RECORDING
  };
}

export default muteVoiceRecording;

export { VOICE_MUTE_RECORDING };

export type { VoiceMuteRecordingAction };
