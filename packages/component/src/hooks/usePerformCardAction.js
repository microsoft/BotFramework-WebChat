import { useContext } from 'react';

import WebChatUIContext from '../WebChatUIContext';

export default function usePerformCardAction() {
  return useContext(WebChatUIContext).onCardAction;
}
