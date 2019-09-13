import { useContext } from 'react';
import WebChatUIContext from '../WebChatUIContext';

export default function useSetDictateInterims() {
  return useContext(WebChatUIContext).setDictateInterims;
}
