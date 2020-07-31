import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useRenderAttachment() {
  return useWebChatUIContext().attachmentRenderer;
}
