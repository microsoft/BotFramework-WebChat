import { type RenderAttachment } from 'botframework-webchat-middleware/legacy';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useRenderAttachment(): RenderAttachment | undefined {
  const { attachmentRenderer } = useWebChatAPIContext();

  return attachmentRenderer;
}
