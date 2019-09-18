import { useContext } from 'react';

import WebChatUIContext from '../WebChatUIContext';

export default function useSubmitSendbox() {
  return useContext(WebChatUIContext).submitSendBox;
}
