import { useContext } from 'react';

import WebChatUIContext from '../WebChatUIContext';

export default function useFocusSendBox() {
  return useContext(WebChatUIContext).focusSendBox;
}
