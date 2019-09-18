import { useContext } from 'react';

import WebChatUIContext from '../WebChatUIContext';

export default function useSendMessageBack() {
  return useContext(WebChatUIContext).sendMessageBack;
}
