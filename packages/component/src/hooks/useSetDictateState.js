import { useContext } from 'react';
import WebChatUIContext from '../WebChatUIContext';

export default function useSetDictateState() {
  return useContext(WebChatUIContext).setDictateState;
}
