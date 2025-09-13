import { WebSpeechPonyfillFactory } from 'botframework-webchat-api';
import { AudioConfig } from 'microsoft-cognitiveservices-speech-sdk';
import { createSpeechServicesPonyfill } from 'web-speech-cognitive-services';

import createMicrophoneAudioConfigAndAudioContext from './speech/createMicrophoneAudioConfigAndAudioContext';
import CognitiveServicesAudioOutputFormat from './types/CognitiveServicesAudioOutputFormat';
import CognitiveServicesCredentials from './types/CognitiveServicesCredentials';
import CognitiveServicesTextNormalization from './types/CognitiveServicesTextNormalization';

export default function createCognitiveServicesSpeechServicesPonyfillFactory({
  audioConfig,
  audioContext,
  audioInputDeviceId,
  credentials,
  enableTelemetry,
  initialSilenceTimeout,
  speechRecognitionEndpointId,
  speechSynthesisDeploymentId,
  speechSynthesisOutputFormat,
  textNormalization
}: {
  audioConfig?: AudioConfig;
  audioContext?: AudioContext;
  audioInputDeviceId?: string;
  credentials: CognitiveServicesCredentials;
  enableTelemetry?: true;
  initialSilenceTimeout?: number | undefined;
  speechRecognitionEndpointId?: string;
  speechSynthesisDeploymentId?: string;
  speechSynthesisOutputFormat?: CognitiveServicesAudioOutputFormat;
  textNormalization?: CognitiveServicesTextNormalization;
}): WebSpeechPonyfillFactory {
  if (!window.navigator.mediaDevices && !audioConfig) {
    console.warn(
      'botframework-webchat: Your browser does not support Web Audio or the page is not loaded via HTTPS or localhost. Cognitive Services Speech Services is disabled. However, you may pass a custom AudioConfig to enable speech in this environment.'
    );

    return () => ({});
  }

  if (audioConfig) {
    audioInputDeviceId &&
      console.warn(
        'botframework-webchat: "audioConfig" and "audioInputDeviceId" cannot be set at the same time; ignoring "audioInputDeviceId".'
      );

    audioContext &&
      console.warn(
        'botframework-webchat: "audioConfig" and "audioContext" cannot be set at the same time; ignoring "audioContext" for speech recognition.'
      );
  } else {
    ({ audioConfig, audioContext } = createMicrophoneAudioConfigAndAudioContext({
      audioContext,
      audioInputDeviceId,
      enableTelemetry
    }));
  }

  return ({ referenceGrammarID } = {}) => {
    const { SpeechGrammarList, SpeechRecognition, speechSynthesis, SpeechSynthesisUtterance } =
      createSpeechServicesPonyfill({
        audioConfig,
        audioContext,
        credentials,
        enableTelemetry,
        initialSilenceTimeout,
        referenceGrammars: referenceGrammarID ? [`luis/${referenceGrammarID}-PRODUCTION`] : [],
        speechRecognitionEndpointId,
        speechSynthesisDeploymentId,
        speechSynthesisOutputFormat,
        textNormalization
      });

    return {
      resumeAudioContext: () => audioContext && audioContext.state === 'suspended' && audioContext.resume(),
      SpeechGrammarList,
      SpeechRecognition,
      speechSynthesis,
      SpeechSynthesisUtterance
    };
  };
}
