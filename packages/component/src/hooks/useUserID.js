import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useUserID() {
  return [useWebChatUIContext().userID];
}
