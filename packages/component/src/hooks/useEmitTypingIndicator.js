import { useContext } from 'react';

import WebChatUIContext from '../WebChatUIContext';

export default function useEmitTypingIndicator() {
  return useContext(WebChatUIContext).emitTypingIndicator;
}
