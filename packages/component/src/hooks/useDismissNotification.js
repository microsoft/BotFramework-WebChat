import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useDismissNotification() {
  return useWebChatUIContext().dismissNotification;
}
