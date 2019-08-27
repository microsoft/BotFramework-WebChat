import { useContext } from 'react';
import WebChatContext from '../Context';

export default function useSelectVoice() {
  return useContext(WebChatContext).selectVoice;
}
