/** Plays the audio of speech-to-speech: registered by the UI, called for the voice activities received. */
type VoiceHandler = {
  queueAudio: (base64: string) => void;
  stopAllAudio: () => void;
};

export type { VoiceHandler };
