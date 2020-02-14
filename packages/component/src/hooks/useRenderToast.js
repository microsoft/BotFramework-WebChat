import { useContext } from 'react';

import WebChatUIContext from '../WebChatUIContext';

export default function useRenderToast() {
  return useContext(WebChatUIContext).toastRenderer;
}
