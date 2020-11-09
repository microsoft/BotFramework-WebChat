import { useSelector } from './internal/WebChatReduxContext';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useSendBoxValue() {
  return [useSelector(({ sendBoxValue }) => sendBoxValue), useWebChatAPIContext().setSendBox];
}
