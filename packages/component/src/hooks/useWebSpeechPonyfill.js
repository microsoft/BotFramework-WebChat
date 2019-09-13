import { useContext } from 'react';
import WebChatUIContext from '../WebChatUIContext';

export default function useWebSpeechPonyfill() {
  return useContext(WebChatUIContext).webSpeechPonyfill;
}
