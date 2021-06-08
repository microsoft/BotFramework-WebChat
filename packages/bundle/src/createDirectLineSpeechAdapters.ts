import { createAdapters } from 'botframework-directlinespeech-sdk';
import WebSpeechPonyfill from 'botframework-webchat-component/lib/types/WebSpeechPonyfill';

import DirectLineJSBotConnection from './types/external/DirectLineJSBotConnection';

export default function createDirectLineSpeechAdapters(
  ...args
): {
  directLine: DirectLineJSBotConnection;
  webSpeechPonyfill: WebSpeechPonyfill;
} {
  return createAdapters(...args);
}
