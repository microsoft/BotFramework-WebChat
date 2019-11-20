import { useContext } from 'react';

import WebChatUIContext from '../WebChatUIContext';

export default function useScrollToEnd() {
  return useContext(WebChatUIContext).scrollToEnd;
}
