import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useSendEvent() {
  return useWebChatAPIContext().sendEvent;
}
