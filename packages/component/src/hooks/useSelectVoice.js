import { useContext } from 'react';
import WebChatUIContext from '../WebChatUIContext';

export default function useSelectVoice() {
  return useContext(WebChatUIContext).selectVoice;
}
