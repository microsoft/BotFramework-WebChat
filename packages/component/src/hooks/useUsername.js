import { useContext } from 'react';
import WebChatUIContext from '../WebChatUIContext';

export default function useUsername() {
  return useContext(WebChatUIContext).username;
}
