import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useRenderToast() {
  return useWebChatAPIContext().toastRenderer;
}
