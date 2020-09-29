import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useSendMessage() {
  return useWebChatAPIContext().sendMessage;
}
