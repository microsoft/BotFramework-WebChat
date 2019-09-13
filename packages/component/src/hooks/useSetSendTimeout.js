import { useContext } from 'react';
import WebChatUIContext from '../WebChatUIContext';

export default function useSetSendTimeout() {
  return useContext(WebChatUIContext).setSendTimeout;
}
