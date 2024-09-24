import createAdapters from '../../src/createAdapters';
import withResolvers from '../../src/utils/withResolvers';
import createFetchCredentials from './createFetchCredentials';
import createQueuedArrayBufferAudioSource from './createQueuedArrayBufferAudioSource';
import fetchSpeechData from './fetchSpeechData';

export default async function createTestHarness({ enableInternalHTTPSupport } = {}) {
  const audioConfig = createQueuedArrayBufferAudioSource();
  const fetchCredentials = createFetchCredentials({ enableInternalHTTPSupport });

  const { directLine, webSpeechPonyfillFactory } = await createAdapters({
    audioConfig,
    fetchCredentials,
    enableInternalHTTPSupport
  });

  return {
    directLine,
    fetchCredentials,
    sendTextAsSpeech: async text => {
      audioConfig.push(await fetchSpeechData({ fetchCredentials, text }));

      // Create a new SpeechRecognition session and start it.
      // By SpeechRecognition.start(), it will invoke Speech SDK to start grabbing speech data from AudioConfig.
      const { SpeechRecognition } = webSpeechPonyfillFactory();
      const recognition = new SpeechRecognition();
      const recognitionEndDeferred = withResolvers();

      recognition.onend = recognitionEndDeferred.resolve;
      recognition.onerror = ({ error }) =>
        recognitionEndDeferred.reject(error || new Error('Speech recognition failed.'));
      recognition.start();

      await recognitionEndDeferred.promise;
    },
    webSpeechPonyfillFactory
  };
}
