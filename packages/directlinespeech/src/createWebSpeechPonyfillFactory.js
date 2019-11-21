import { AudioConfig } from 'microsoft-cognitiveservices-speech-sdk';
import { createSpeechRecognitionPonyfillFromRecognizer } from 'web-speech-cognitive-services/lib/SpeechServices/SpeechToText';
import AbortController from 'abort-controller';

import createErrorEvent from './createErrorEvent';
import createTaskQueue from './createTaskQueue';
import EventTargetShim, { defineEventAttribute } from './external/event-target-shim';
import playCognitiveServicesStream from './playCognitiveServicesStream';
import playWhiteNoise from './playWhiteNoise';
import SpeechSynthesisAudioStreamUtterance from './SpeechSynthesisAudioStreamUtterance';

export default function({
  audioConfig = AudioConfig.fromDefaultMicrophoneInput(),
  enableTelemetry,
  recognizer,
  speechRecognitionEndpointId,
  speechSynthesisDeploymentId,
  speechSynthesisOutputFormat,
  textNormalization
}) {
  if (speechRecognitionEndpointId) {
    console.warn(
      'botframework-directlinespeech: Custom Speech is currently not supported, ignoring speechRecognitionEndpointId.'
    );
  }

  if (speechSynthesisDeploymentId) {
    console.warn(
      'botframework-directlinespeech: Custom Voice is currently not supported, ignoring speechSynthesisDeploymentId.'
    );
  }

  if (speechSynthesisOutputFormat) {
    console.warn(
      'botframework-directlinespeech: Custom Voice is currently not supported, ignoring speechSynthesisOutputFormat.'
    );
  }

  return () => {
    const { SpeechGrammarList, SpeechRecognition } = createSpeechRecognitionPonyfillFromRecognizer({
      audioConfig,
      createRecognizer: () => recognizer,
      enableTelemetry,
      looseEvents: true,
      textNormalization
    });

    const audioContext = new AudioContext();

    const { cancelAll, push } = createTaskQueue();

    class SpeechSynthesis extends EventTargetShim {
      cancel() {
        cancelAll();
      }

      getVoices() {
        return [];
      }

      speak(utterance) {
        push(() => {
          const { abort, signal } = new AbortController();

          return {
            abort,
            result: (async () => {
              utterance.dispatchEvent(new Event('start'));

              try {
                if (utterance.audioStream) {
                  const { format, streamReader } = utterance.audioStream;

                  await playCognitiveServicesStream(audioContext, format, streamReader, { signal });
                } else {
                  await playWhiteNoise(audioContext);
                }
              } catch (error) {
                utterance.dispatchEvent(createErrorEvent(error));
              }

              utterance.dispatchEvent(new Event('end'));
            })()
          };
        });
      }
    }

    defineEventAttribute(SpeechSynthesis, 'voiceschanged');

    return {
      SpeechGrammarList,
      SpeechRecognition,
      speechSynthesis: new SpeechSynthesis(),
      SpeechSynthesisUtterance: SpeechSynthesisAudioStreamUtterance
    };
  };
}
