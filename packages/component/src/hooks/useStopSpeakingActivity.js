import { useContext } from 'react';
import WebChatUIContext from '../WebChatUIContext';

export default function useStopSpeakingActivity() {
  return useContext(WebChatUIContext).stopSpeakingActivity;
}
