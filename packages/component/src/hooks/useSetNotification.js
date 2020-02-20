import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useSetNotification() {
  return useWebChatUIContext().setNotification;
}
