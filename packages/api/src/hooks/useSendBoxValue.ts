import { useSelector } from './internal/WebChatReduxContext';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useSendBoxValue(): [string, (value: string) => void] {
  return [useSelector(({ sendBoxValue }) => sendBoxValue), useWebChatAPIContext().setSendBox];
}
