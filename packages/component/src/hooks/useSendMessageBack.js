import { useContext } from 'react';
import WebChatContext from '../Context';

export default function useMessageBack() {
  return useContext(WebChatContext).messageBack;
}
