import { useContext } from 'react';
import WebChatContext from '../Context';

export default function useStopSpeakingActivity() {
  return useContext(WebChatContext).stopSpeakingActivity;
}
