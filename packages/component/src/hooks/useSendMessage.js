import { useContext } from 'react';

import WebChatUIContext from '../WebChatUIContext';

export default function useSendMessage() {
  return useContext(WebChatUIContext).sendMessage;
}
