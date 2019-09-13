import { useContext } from 'react';
import WebChatUIContext from '../WebChatUIContext';

export default function useSendFiles() {
  return useContext(WebChatUIContext).sendFiles;
}
