import { useSelector } from './internal/WebChatReduxContext';

const selectSendTypingIndicator = ({ sendTypingIndicator }) => sendTypingIndicator;

export default function useSendTypingIndicator(): [boolean] {
  return [useSelector(selectSendTypingIndicator)];
}
