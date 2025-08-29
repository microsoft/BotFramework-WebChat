import { type LegacyRenderAttachment } from '@msinternal/botframework-webchat-api-middleware/legacy';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useRenderAttachment(): LegacyRenderAttachment | undefined {
  const { attachmentRenderer } = useWebChatAPIContext();

  return attachmentRenderer;
}
