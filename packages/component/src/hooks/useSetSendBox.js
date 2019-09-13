import { useContext } from 'react';
import WebChatUIContext from '../WebChatUIContext';

export default function useSetSendBox() {
  return useContext(WebChatUIContext).setSendBox;
}
