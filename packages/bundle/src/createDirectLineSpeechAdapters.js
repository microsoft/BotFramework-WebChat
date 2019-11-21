import { createAdapters } from 'botframework-directlinespeech-sdk';

export default function createDirectLineSpeechAdapters(...args) {
  return createAdapters(...args);
}
