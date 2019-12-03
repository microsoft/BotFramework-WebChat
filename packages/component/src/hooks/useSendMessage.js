import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useSendMessage() {
  return useWebChatUIContext().sendMessage;
}
