import { useContext } from 'react';
import WebChatUIContext from '../WebChatUIContext';

export default function useAttachmentRenderer() {
  return useContext(WebChatUIContext).attachmentRenderer;
}
