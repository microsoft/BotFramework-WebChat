import { useContext } from 'react';
import WebChatUIContext from '../WebChatUIContext';

export default function useStartDictate() {
  return useContext(WebChatUIContext).startDictate;
}
