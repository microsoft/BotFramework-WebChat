import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useEmitTypingIndicator(): () => void {
  return useWebChatAPIContext().emitTypingIndicator;
}
