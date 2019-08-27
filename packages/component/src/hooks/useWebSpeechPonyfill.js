import { useContext } from 'react';
import WebChatContext from '../Context';

export default function useWebSpeechPonyfill() {
  return useContext(WebChatContext).webSpeechPonyfill;
}
