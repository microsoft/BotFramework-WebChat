import { useContext } from 'react';
import WebChatUIContext from '../WebChatUIContext';

export default function useUserID() {
  return useContext(WebChatUIContext).userID;
}
