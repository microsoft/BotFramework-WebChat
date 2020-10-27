import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useSendPostBack() {
  return useWebChatAPIContext().sendPostBack;
}
