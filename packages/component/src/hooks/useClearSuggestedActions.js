import { useContext } from 'react';
import WebChatUIContext from '../WebChatUIContext';

export default function useClearSuggestedActions() {
  return useContext(WebChatUIContext).clearSuggestedActions;
}
