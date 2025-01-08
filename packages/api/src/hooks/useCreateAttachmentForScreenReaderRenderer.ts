import useWebChatAPIContext from './internal/useWebChatAPIContext';

import { type AttachmentForScreenReaderComponentFactory } from '../types/AttachmentForScreenReaderMiddleware';

export default function useCreateAttachmentForScreenReaderRenderer(): AttachmentForScreenReaderComponentFactory {
  return useWebChatAPIContext().attachmentForScreenReaderRenderer;
}
