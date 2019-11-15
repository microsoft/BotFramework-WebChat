import { useContext } from 'react';

import WebChatUIContext from '../WebChatUIContext';

export default function useSendPostBack() {
  return useContext(WebChatUIContext).sendPostBack;
}
