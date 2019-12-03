import { useSelector } from '../WebChatReduxContext';
import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useDictateInterims() {
  return [useSelector(({ dictateInterims }) => dictateInterims) || [], useWebChatUIContext().setDictateInterims];
}
