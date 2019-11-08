import { AudioConfig } from 'microsoft-cognitiveservices-speech-sdk/distrib/lib/src/sdk/Audio/AudioConfig';
import createPonyfill from 'web-speech-cognitive-services/lib/SpeechServices';

export default function createCognitiveServicesSpeechServicesPonyfillFactory({
  audioConfig,
  authorizationToken,
  enableTelemetry,
  region,
  speechRecognitionEndpointId,
  speechSynthesisDeploymentId,
  speechSynthesisOutputFormat,
  subscriptionKey,
  textNormalization
}) {
  // HACK: We should prevent AudioContext object from being recreated because they may be blessed and UX-wise expensive to recreate.
  //       In Cognitive Services SDK, if they detect the "end" function is falsy, they will not call "end" but "suspend" instead.
  //       And on next recognition, they will re-use the AudioContext object.
  if (!audioConfig) {
    audioConfig = AudioConfig.fromDefaultMicrophoneInput();

    const source = audioConfig.privSource;

    // This piece of code is adopted from microsoft-cognitiveservices-speech-sdk/common.browser/MicAudioSource.ts.
    // Instead of closing the AudioContext, it will just suspend it. And the next time it is needed, it will be resumed (by the original code).
    source.destroyAudioContext = () => {
      if (!source.privContext) {
        return;
      }

      source.privRecorder.releaseMediaResources(source.privContext);
      source.privContext.state === 'running' && source.privContext.suspend();
    };
  }

  return ({ referenceGrammarID }) => {
    const ponyfill = createPonyfill({
      audioConfig,
      authorizationToken,
      enableTelemetry,
      referenceGrammars: [`luis/${referenceGrammarID}-PRODUCTION`],
      region,
      speechRecognitionEndpointId,
      speechSynthesisDeploymentId,
      speechSynthesisOutputFormat,
      subscriptionKey,
      textNormalization
    });

    const { SpeechGrammarList, SpeechRecognition, speechSynthesis, SpeechSynthesisUtterance } = ponyfill;

    return {
      SpeechGrammarList,
      SpeechRecognition,
      speechSynthesis,
      SpeechSynthesisUtterance
    };
  };
}
