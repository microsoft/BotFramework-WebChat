import useWebChatUIContext from './internal/useWebChatUIContext';

export default function usePerformCardAction() {
  return useWebChatUIContext().onCardAction;
}
