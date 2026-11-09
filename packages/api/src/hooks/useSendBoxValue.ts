import { useSelector } from './internal/WebChatReduxContext';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

const selectSendBoxValue = ({ sendBoxValue }) => sendBoxValue;

export default function useSendBoxValue(): [string, (value: string) => void] {
  return [useSelector(selectSendBoxValue), useWebChatAPIContext().setSendBox];
}
