import { useContext } from 'react';
import WebChatContext from '../Context';

export default function useSetSendTimeout() {
  return useContext(WebChatContext).setSendTimeout;
}
