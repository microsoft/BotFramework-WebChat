import { SpeechState } from 'botframework-webchat-core';

type SpeechToSpeech = {
  recording: boolean;
  setRecording: (recording: boolean) => void;
  speechState: SpeechState;
};

export type { SpeechToSpeech };
