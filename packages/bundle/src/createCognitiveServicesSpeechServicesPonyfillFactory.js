import { AudioConfig } from 'microsoft-cognitiveservices-speech-sdk/distrib/lib/src/sdk/Audio/AudioConfig';
import createPonyfill from 'web-speech-cognitive-services/lib/SpeechServices';

export default function createCognitiveServicesSpeechServicesPonyfillFactory({
  audioConfig,
  audioContext,
  audioInputDeviceId,
  credentials,
  enableTelemetry,
  speechRecognitionEndpointId,
  speechSynthesisDeploymentId,
  speechSynthesisOutputFormat,
  textNormalization
}) {
  if (!window.navigator.mediaDevices && !audioConfig) {
    console.warn(
      'botframework-webchat: Your browser does not support Web Audio or the page is not loaded via HTTPS or localhost. Cognitive Services Speech Services is disabled. However, you may pass a custom AudioConfig to enable speech in this environment.'
    );

    return () => ({});
  }

  if (audioConfig && audioInputDeviceId) {
    console.warn(
      'botframework-webchat: "audioConfig" and "audioInputDeviceId" cannot be set at the same time; ignoring "audioInputDeviceId".'
    );
  }

  // WORKAROUND: We should prevent AudioContext object from being recreated because they may be blessed and UX-wise expensive to recreate.
  //             In Cognitive Services SDK, if they detect the "end" function is falsy, they will not call "end" but "suspend" instead.
  //             And on next recognition, they will re-use the AudioContext object.
  if (!audioConfig) {
    audioConfig = audioInputDeviceId
      ? AudioConfig.fromMicrophoneInput(audioInputDeviceId)
      : AudioConfig.fromDefaultMicrophoneInput();
  }

  return ({ referenceGrammarID } = {}) => {
    const { SpeechGrammarList, SpeechRecognition, speechSynthesis, SpeechSynthesisUtterance } = createPonyfill({
      audioConfig,
      audioContext,
      credentials,
      enableTelemetry,
      referenceGrammars: referenceGrammarID ? [`luis/${referenceGrammarID}-PRODUCTION`] : [],
      speechRecognitionEndpointId,
      speechSynthesisDeploymentId,
      speechSynthesisOutputFormat,
      textNormalization
    });

    return {
      SpeechGrammarList,
      SpeechRecognition,
      speechSynthesis,
      SpeechSynthesisUtterance
    };
  };
}
