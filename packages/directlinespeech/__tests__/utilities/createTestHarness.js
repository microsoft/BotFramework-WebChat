import createAdapters from '../../src/createAdapters';
import createDeferred from '../../src/external/p-defer';
import createQueuedArrayBufferAudioSource from './createQueuedArrayBufferAudioSource';
import fetchSpeechCredentialsWithCache from './fetchSpeechCredentialsWithCache';
import fetchSpeechData from './fetchSpeechData';

export default async function createTestHarness() {
  const audioConfig = createQueuedArrayBufferAudioSource();
  const { directLine, webSpeechPonyfillFactory } = await createAdapters({
    audioConfig,
    fetchCredentials: fetchSpeechCredentialsWithCache
  });

  return {
    directLine,
    sendTextAsSpeech: async text => {
      audioConfig.push(await fetchSpeechData({ text }));

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
