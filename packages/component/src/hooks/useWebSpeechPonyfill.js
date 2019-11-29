import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useWebSpeechPonyfill() {
  return [useWebChatUIContext().webSpeechPonyfill];
}
