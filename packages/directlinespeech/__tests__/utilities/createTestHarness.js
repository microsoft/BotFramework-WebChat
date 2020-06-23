import createDeferred from 'p-defer-es5';

import createAdapters from '../../src/createAdapters';
import createQueuedArrayBufferAudioSource from './createQueuedArrayBufferAudioSource';
import fetchSpeechCredentials from './fetchSpeechCredentials';
import fetchSpeechData from './fetchSpeechData';

export default async function createTestHarness({ enableInternalHTTPSupport } = {}) {
  const audioConfig = createQueuedArrayBufferAudioSource();
  const credentials = fetchSpeechCredentials({ enableInternalHTTPSupport });

  const { directLine, webSpeechPonyfillFactory } = await createAdapters({
    audioConfig,
    fetchCredentials: credentials,
    enableInternalHTTPSupport
  });

  return {
    credentials,
    directLine,
    sendTextAsSpeech: async text => {
      audioConfig.push(await fetchSpeechData({ credentials, text }));

      // Create a new SpeechRecognition session and start it.
      // By SpeechRecognition.start(), it will invoke Speech SDK to start grabbing speech data from AudioConfig.
      const { SpeechRecognition } = webSpeechPonyfillFactory();
      const recognition = new SpeechRecognition();
      const recognitionEndDeferred = createDeferred();

      recognition.onend = recognitionEndDeferred.resolve;
      recognition.onerror = ({ error }) =>
        recognitionEndDeferred.reject(error || new Error('Speech recognition failed.'));
      recognition.start();

      await recognitionEndDeferred.promise;
    },
    webSpeechPonyfillFactory
  };
}
