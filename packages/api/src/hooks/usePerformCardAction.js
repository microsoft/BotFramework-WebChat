import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function usePerformCardAction() {
  return useWebChatAPIContext().onCardAction;
}
