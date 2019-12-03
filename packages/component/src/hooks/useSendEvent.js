import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useSendEvent() {
  return useWebChatUIContext().sendEvent;
}
