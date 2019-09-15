import { useContext } from 'react';
import WebChatUIContext from '../WebChatUIContext';

export default function useAttachmentRenderer() {
  return [
    useContext(WebChatUIContext).attachmentRenderer,
    () => {
      throw new Error('AttachmentRenderer must be set using props.');
    }
  ];
}
