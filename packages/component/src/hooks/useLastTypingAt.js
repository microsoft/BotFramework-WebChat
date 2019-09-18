import { useSelector } from '../WebChatReduxContext';

export default function useLastTypingAt() {
  return [useSelector(({ lastTypingAt }) => lastTypingAt)];
}
