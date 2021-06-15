import { useSelector } from './internal/WebChatReduxContext';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useDictateInterims(): [string[], (interims: string[]) => void] {
  return [useSelector(({ dictateInterims }) => dictateInterims) || [], useWebChatAPIContext().setDictateInterims];
}
