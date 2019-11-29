import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useSendPostBack() {
  return useWebChatUIContext().sendPostBack;
}
