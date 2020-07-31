import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useRenderTypingIndicator() {
  return useWebChatUIContext().typingIndicatorRenderer;
}
