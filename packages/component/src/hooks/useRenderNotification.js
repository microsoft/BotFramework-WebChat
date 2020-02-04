import { useContext } from 'react';

import WebChatUIContext from '../WebChatUIContext';

export default function useRenderNotification() {
  return useContext(WebChatUIContext).notificationRenderer;
}
