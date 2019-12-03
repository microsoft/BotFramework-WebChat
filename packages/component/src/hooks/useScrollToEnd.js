import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useScrollToEnd() {
  return useWebChatUIContext().scrollToEnd;
}
