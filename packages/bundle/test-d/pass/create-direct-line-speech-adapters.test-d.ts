import '../setup';

import { type WebSpeechPonyfillFactory } from 'botframework-webchat-api';
import { expectType } from 'tsd';

import { createDirectLineSpeechAdapters } from '../../src/boot/exports/index';

(async () => {
  const { webSpeechPonyfillFactory } = await createDirectLineSpeechAdapters({
    fetchCredentials: { authorizationToken: '...', region: 'westus2' }
  });

  // Same name as the `webSpeechPonyfillFactory` prop, so the adapters can be spread into it.
  expectType<WebSpeechPonyfillFactory>(webSpeechPonyfillFactory);
})();
