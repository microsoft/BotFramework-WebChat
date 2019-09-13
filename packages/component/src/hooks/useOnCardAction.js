import { useContext } from 'react';
import WebChatUIContext from '../WebChatUIContext';

export default function useOnCardAction() {
  return useContext(WebChatUIContext).onCardAction;
}
