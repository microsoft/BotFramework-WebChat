import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useFocusSendBox() {
  return useWebChatUIContext().focusSendBox;
}
