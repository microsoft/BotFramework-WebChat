import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useSetNotification() {
  console.log(useWebChatUIContext());
  return useWebChatUIContext().setNotification;
}
