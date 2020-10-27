import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useRenderAttachment() {
  const { attachmentRenderer } = useWebChatAPIContext();

  return attachmentRenderer;
}
