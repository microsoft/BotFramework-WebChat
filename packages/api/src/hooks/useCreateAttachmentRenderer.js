import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useCreateAttachmentRenderer() {
  const { attachmentRenderer: createAttachmentRenderer } = useWebChatAPIContext();

  return createAttachmentRenderer;
}
