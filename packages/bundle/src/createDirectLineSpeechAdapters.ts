import { AudioConfig } from 'microsoft-cognitiveservices-speech-sdk';
import { createAdapters } from 'botframework-directlinespeech-sdk';
import { WebSpeechPonyfill } from 'botframework-webchat-api';
import type { DirectLineJSBotConnection } from 'botframework-webchat-core';

import CognitiveServicesAudioOutputFormat from './types/CognitiveServicesAudioOutputFormat';
import CognitiveServicesCredentials from './types/CognitiveServicesCredentials';
import CognitiveServicesTextNormalization from './types/CognitiveServicesTextNormalization';
import createMicrophoneAudioConfigAndAudioContext from './speech/createMicrophoneAudioConfigAndAudioContext';

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
  } else if (!window.navigator.mediaDevices) {
    // If the browser does not support or allow microphone access, we will continue to create Direct Line Speech adapter without custom "audioConfig" and "audioContext".
    // In Direct Line Speech SDK, it will disable speech functionality, only leaving text chat available via the protocol.
    console.warn(
      'botframework-webchat: Your browser does not support or allow microphone access or the page is not loaded via HTTPS or localhost. Speech is disabled for Direct Line Speech. However, you may pass a custom "audioConfig" to enable speech in this environment.'
    );
  } else {
    ({ audioConfig, audioContext } = createMicrophoneAudioConfigAndAudioContext({
      audioContext,
      audioInputDeviceId,
      enableTelemetry
    }));
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
