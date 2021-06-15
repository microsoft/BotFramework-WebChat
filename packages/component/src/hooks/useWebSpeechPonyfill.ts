import { WebSpeechPonyfill } from 'botframework-webchat-api';

import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useWebSpeechPonyfill(): [WebSpeechPonyfill] {
  return [useWebChatUIContext().webSpeechPonyfill];
}
