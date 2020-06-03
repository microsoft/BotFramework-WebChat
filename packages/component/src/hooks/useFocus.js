import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useFocus() {
  return useWebChatUIContext().focus;
}
