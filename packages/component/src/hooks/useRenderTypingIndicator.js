import { useContext } from 'react';

import WebChatUIContext from '../WebChatUIContext';

export default function useRenderTypingIndicator() {
  return useContext(WebChatUIContext).typingIndicatorRenderer;
}
