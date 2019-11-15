import { useContext } from 'react';

import WebChatUIContext from '../WebChatUIContext';

export default function useSendEvent() {
  return useContext(WebChatUIContext).sendEvent;
}
