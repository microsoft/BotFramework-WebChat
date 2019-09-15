import { useSelector } from '../WebChatReduxContext';

export default function useLastTypingAt() {
  return [
    useSelector(({ lastTypingAt }) => lastTypingAt),
    () => {
      throw new Error('LastTypingAt cannot be set.');
    }
  ];
}
