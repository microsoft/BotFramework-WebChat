import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useWebSpeechPonyfill() {
  return [useWebChatAPIContext().webSpeechPonyfill];
}
