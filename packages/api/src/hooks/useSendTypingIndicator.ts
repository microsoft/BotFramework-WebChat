import { useSelector } from './internal/WebChatReduxContext';

export default function useSendTypingIndicator(): [boolean] {
  return [useSelector(({ sendTypingIndicator }) => sendTypingIndicator)];
}
