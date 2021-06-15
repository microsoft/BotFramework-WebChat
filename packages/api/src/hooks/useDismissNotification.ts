import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useDismissNotification(): (id: string) => void {
  return useWebChatAPIContext().dismissNotification;
}
