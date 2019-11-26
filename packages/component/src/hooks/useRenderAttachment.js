import { useContext } from 'react';

import WebChatUIContext from '../WebChatUIContext';

export default function useRenderAttachment() {
  return useContext(WebChatUIContext).attachmentRenderer;
}
