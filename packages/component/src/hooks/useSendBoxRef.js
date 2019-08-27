import { useContext } from 'react';
import WebChatContext from '../Context';

export default function useSendBoxRef() {
  return useContext(WebChatContext).sendBoxRef;
}
