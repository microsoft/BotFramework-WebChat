import { useContext } from 'react';
import WebChatContext from '../Context';

export default function useSetSendBox() {
  return useContext(WebChatContext).setSendBox;
}
