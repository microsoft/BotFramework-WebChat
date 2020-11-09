import { useSelector } from './internal/WebChatReduxContext';

export default function useSendTypingIndicator() {
  return [useSelector(({ sendTypingIndicator }) => sendTypingIndicator)];
}
