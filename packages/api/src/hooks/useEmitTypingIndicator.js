import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useEmitTypingIndicator() {
  return useWebChatAPIContext().emitTypingIndicator;
}
