import { AudioConfig } from 'microsoft-cognitiveservices-speech-sdk';
import { createAdapters } from 'botframework-directlinespeech-sdk';
import { DirectLineJSBotConnection } from 'botframework-webchat-core';
import { WebSpeechPonyfill } from 'botframework-webchat-api';

import CognitiveServicesAudioOutputFormat from './types/CognitiveServicesAudioOutputFormat';
import CognitiveServicesCredentials from './types/CognitiveServicesCredentials';
import CognitiveServicesTextNormalization from './types/CognitiveServicesTextNormalization';
import createMicrophoneAudioConfig from './speech/createMicrophoneAudioConfig';

const DEFAULT_LANGUAGE = 'en-US';

// TODO: When using DLSpeech via bundle, we will add our own MicrophoneAudioConfig.
export default function createDirectLineSpeechAdapters({
  audioConfig,
  audioContext,
  audioInputDeviceId,
  enableInternalHTTPSupport,
  enableTelemetry,
  fetchCredentials,
  speechRecognitionEndpointId,
  speechRecognitionLanguage = window?.navigator?.language || DEFAULT_LANGUAGE,
  speechSynthesisDeploymentId,
  speechSynthesisOutputFormat,
  textNormalization,
  userID,
  username
}: {
  audioConfig?: AudioConfig;
  audioContext?: AudioContext;
  audioInputDeviceId?: string;
  enableInternalHTTPSupport?: true;
  enableTelemetry?: true;
  fetchCredentials: CognitiveServicesCredentials;
  speechRecognitionEndpointId?: string;
  speechRecognitionLanguage?: string;
  speechSynthesisDeploymentId?: string;
  speechSynthesisOutputFormat?: CognitiveServicesAudioOutputFormat;
  textNormalization?: CognitiveServicesTextNormalization;
  userID?: string;
  username?: string;
}): {
  directLine: DirectLineJSBotConnection;
  webSpeechPonyfill: WebSpeechPonyfill;
} {
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
    const result = createMicrophoneAudioConfig({
      audioContext,
      audioInputDeviceId,
      enableTelemetry
    });

    ({ audioConfig, audioContext } = result);
  }

  return createAdapters({
    audioConfig,
    audioContext,
    enableInternalHTTPSupport,
    enableTelemetry,
    fetchCredentials,
    speechRecognitionEndpointId,
    speechRecognitionLanguage,
    speechSynthesisDeploymentId,
    speechSynthesisOutputFormat,
    textNormalization,
    userID,
    username
  });
}
