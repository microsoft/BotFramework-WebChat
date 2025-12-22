import { createContext } from 'react';
import { SpeechState } from '../types/SpeechState';

type SpeechToSpeechContextType = {
  recording: boolean;
  setRecording: (recording: boolean) => void;
  speechState: SpeechState;
};

const SpeechToSpeechContext = createContext<SpeechToSpeechContextType>(undefined!);

export default SpeechToSpeechContext;

export type { SpeechToSpeechContextType };
