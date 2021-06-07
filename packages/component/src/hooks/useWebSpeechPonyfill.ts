import useWebChatUIContext from './internal/useWebChatUIContext';
import WebSpeechPonyfill from '../types/WebSpeechPonyfill';

export default function useWebSpeechPonyfill(): [WebSpeechPonyfill] {
  return [useWebChatUIContext().webSpeechPonyfill];
}
