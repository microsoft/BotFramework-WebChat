import { useContext } from 'react';
import WebChatContext from '../Context';

export default function useSendEvent() {
  return useContext(WebChatContext).sendEvent;
}
