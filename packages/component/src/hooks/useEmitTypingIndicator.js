import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useEmitTypingIndicator() {
  return useWebChatUIContext().emitTypingIndicator;
}
