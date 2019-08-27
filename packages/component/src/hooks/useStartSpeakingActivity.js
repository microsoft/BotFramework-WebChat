import { useContext } from 'react';
import WebChatContext from '../Context';

export default function useStartSpeakingActivity() {
  return useContext(WebChatContext).startSpeakingActivity;
}
