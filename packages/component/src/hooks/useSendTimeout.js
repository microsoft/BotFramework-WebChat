import { useSelector } from '../WebChatReduxContext';

export default function useSendTimeout() {
  return useSelector(({ sendTimeout }) => sendTimeout);
}
