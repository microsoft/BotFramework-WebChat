import { useContext } from 'react';
import WebChatUIContext from '../WebChatUIContext';

export default function useSendBoxRef() {
  return useContext(WebChatUIContext).sendBoxRef;
}
