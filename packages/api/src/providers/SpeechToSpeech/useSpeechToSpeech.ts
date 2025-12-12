import { SpeechToSpeechContextType } from './private/Context';
import useSpeechToSpeechContext from './private/useContext';

export default function useSpeechToSpeech(): readonly [SpeechToSpeechContextType] {
  return [useSpeechToSpeechContext()];
}
