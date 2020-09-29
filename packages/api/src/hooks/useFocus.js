import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useFocus() {
  return useWebChatAPIContext().focus;
}
