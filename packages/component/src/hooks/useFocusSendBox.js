import { useContext } from 'react';
import WebChatContext from '../Context';

export default function useFocusSendBox() {
  return useContext(WebChatContext).focusSendBox;
}
