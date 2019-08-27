import { useContext } from 'react';
import WebChatContext from '../Context';

export default function useSendPostBack() {
  return useContext(WebChatContext).sendPostBack;
}
