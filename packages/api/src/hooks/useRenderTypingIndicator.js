import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useRenderTypingIndicator() {
  return useWebChatAPIContext().typingIndicatorRenderer;
}
