import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useSendMessageBack() {
  return useWebChatAPIContext().sendMessageBack;
}
