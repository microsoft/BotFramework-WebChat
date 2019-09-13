import { useContext } from 'react';
import WebChatUIContext from '../WebChatUIContext';

export default function useStartSpeakingActivity() {
  return useContext(WebChatUIContext).startSpeakingActivity;
}
