import { useSelector } from '../WebChatReduxContext';

export default function useSendTypingIndicator() {
  return [useSelector(({ sendTypingIndicator }) => sendTypingIndicator)];
}
