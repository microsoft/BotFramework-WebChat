import { useContext } from 'react';
import WebChatContext from '../Context';

export default function useAttachmentRenderer() {
  return useContext(WebChatContext).attachmentRenderer;
}
