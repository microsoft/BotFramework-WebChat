import { createAdapters } from 'botframework-directlinespeech-sdk';
import { DirectLineJSBotConnection } from 'botframework-webchat-core';
import { WebSpeechPonyfill } from 'botframework-webchat-api';

export default function createDirectLineSpeechAdapters(
  ...args
): {
  directLine: DirectLineJSBotConnection;
  webSpeechPonyfill: WebSpeechPonyfill;
} {
  return createAdapters(...args);
}
