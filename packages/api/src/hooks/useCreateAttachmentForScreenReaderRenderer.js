import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useCreateAttachmentForScreenReaderRenderer() {
  return useWebChatAPIContext().attachmentForScreenReaderRenderer;
}
