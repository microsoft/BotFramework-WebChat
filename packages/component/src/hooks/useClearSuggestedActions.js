import { useContext } from 'react';
import WebChatContext from '../Context';

export default function useClearSuggestedActions() {
  return useContext(WebChatContext).clearSuggestedActions;
}
