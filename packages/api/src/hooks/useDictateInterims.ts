import { useSelector } from './internal/WebChatReduxContext';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

const selectDictateInterims = ({ dictateInterims }) => dictateInterims;

export default function useDictateInterims(): [string[], (interims: string[]) => void] {
  return [useSelector(selectDictateInterims) || [], useWebChatAPIContext().setDictateInterims];
}
