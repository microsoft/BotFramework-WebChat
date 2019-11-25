import { useContext } from 'react';

import WebChatUIContext from '../WebChatUIContext';

export default function useStopDictate() {
  return useContext(WebChatUIContext).stopDictate;
}
