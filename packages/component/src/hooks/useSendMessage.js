import { useContext } from 'react';
import WebChatContext from '../Context';

export default function useSendMessage() {
  return useContext(WebChatContext).sendMessage;
}
