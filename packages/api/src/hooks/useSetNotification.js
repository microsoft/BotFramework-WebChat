import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useSetNotification() {
  return useWebChatAPIContext().setNotification;
}
