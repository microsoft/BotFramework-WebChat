import { useSelector } from '../WebChatReduxContext';
import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useTimeoutForSend() {
  return [useSelector(({ sendTimeout }) => sendTimeout), useWebChatUIContext().setSendTimeout];
}
