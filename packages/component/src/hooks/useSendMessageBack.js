import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useSendMessageBack() {
  return useWebChatUIContext().sendMessageBack;
}
