import { useDictateInterimsSlice } from './internal/domains/SpeechSlices';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useDictateInterims(): [string[], (interims: string[]) => void] {
  return [useDictateInterimsSlice() || [], useWebChatAPIContext().setDictateInterims];
}
