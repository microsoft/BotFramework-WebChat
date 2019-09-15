import { useContext } from 'react';
import WebChatUIContext from '../WebChatUIContext';

export default function useWebSpeechPonyfill() {
  return [
    useContext(WebChatUIContext).webSpeechPonyfill,
    () => {
      throw new Error('WebSpeechPonyfill must be set using props.');
    }
  ];
}
