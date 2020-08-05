import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useRenderToast() {
  return useWebChatUIContext().toastRenderer;
}
