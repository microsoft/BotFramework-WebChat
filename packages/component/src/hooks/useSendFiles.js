import { useContext } from 'react';
import WebChatContext from '../Context';

export default function useSendFiles() {
  return useContext(WebChatContext).sendFiles;
}
