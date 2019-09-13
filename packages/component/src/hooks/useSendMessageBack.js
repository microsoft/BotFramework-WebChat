import { useContext } from 'react';
import WebChatUIContext from '../WebChatUIContext';

export default function useMessageBack() {
  return useContext(WebChatUIContext).messageBack;
}
