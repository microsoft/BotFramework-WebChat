import { useSelector } from '../WebChatReduxContext';
import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useSendBoxValue() {
  return [useSelector(({ sendBoxValue }) => sendBoxValue), useWebChatUIContext().setSendBox];
}
