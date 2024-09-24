import { type RenderAttachment } from '../types/AttachmentMiddleware';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useRenderAttachment(): RenderAttachment | undefined {
  const { attachmentRenderer } = useWebChatAPIContext();

  return attachmentRenderer;
}
