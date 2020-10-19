import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useCreateAttachmentForScreenReaderRenderer() {
  return useWebChatUIContext().createAttachmentForScreenReaderRenderer;
}
