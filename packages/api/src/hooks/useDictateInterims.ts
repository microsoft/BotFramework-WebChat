import { useSpeechContext } from './internal/domains/SpeechContext';
import useSourceValue from './internal/domains/useSourceValue';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useDictateInterims(): [string[], (interims: string[]) => void] {
  return [useSourceValue(useSpeechContext().dictateInterims) || [], useWebChatAPIContext().setDictateInterims];
}
