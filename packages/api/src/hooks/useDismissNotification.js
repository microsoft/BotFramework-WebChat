import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useDismissNotification() {
  return useWebChatAPIContext().dismissNotification;
}
