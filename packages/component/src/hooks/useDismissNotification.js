import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useDismissNotification() {
  const { dismissNotification } = useWebChatUIContext();

  return id => dismissNotification(id);
}
