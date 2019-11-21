import { BotFrameworkConfig, DialogServiceConnector, PropertyId } from 'microsoft-cognitiveservices-speech-sdk';

import createWebSpeechPonyfillFactory from './createWebSpeechPonyfillFactory';
import DirectLineSpeech from './DirectLineSpeech';
import patchDialogServiceConnectorInline from './patchDialogServiceConnectorInline';

export default function create({
  audioConfig,
  audioContext,
  enableTelemetry,
  speechRecognitionEndpointId,
  speechRecognitionLanguage = (typeof window !== 'undefined' &&
    typeof window.navigator !== 'undefined' &&
    window.navigator.language) ||
    'en-US',
  speechServicesAuthorizationToken,
  speechServicesRegion,
  speechServicesSubscriptionKey,
  speechSynthesisDeploymentId,
  speechSynthesisOutputFormat,
  textNormalization,
  userID,
  username
}) {
  if (
    (!speechServicesAuthorizationToken && !speechServicesSubscriptionKey) ||
    (speechServicesAuthorizationToken && speechServicesSubscriptionKey)
  ) {
    throw new Error(
      'You must specify either "speechServicesAuthorizationToken" or "speechServicesSubscriptionKey" only.'
    );
  }

  if (textNormalization) {
    console.warn(
      'botframework-directlinespeech: Text normalization is currently not supported, ignoreing "textNormalization".'
    );
  }

  if (userID || username) {
    console.warn(
      'botframework-directlinespeech: Custom "userId" and "username" are currently not supported, ignoring.'
    );
  }

  let config;

  if (speechServicesAuthorizationToken) {
    config = BotFrameworkConfig.fromAuthorizationToken(speechServicesAuthorizationToken, speechServicesRegion);
  } else {
    config = BotFrameworkConfig.fromSubscription(speechServicesSubscriptionKey, speechServicesRegion);
  }

  // Supported options can be found in DialogConnectorFactory.js.

  config.setProperty(PropertyId.SpeechServiceConnection_RecoLanguage, speechRecognitionLanguage);

  // None of the following works for setting output format.

  // config.setProperty(PropertyId.SpeechServiceResponse_OutputFormatOption, OutputFormat[OutputFormat.Detailed]);
  // config.setProperty(PropertyId.SpeechServiceResponse_RequestDetailedResultTrueFalse, true);
  // config.setProperty(OutputFormatPropertyName, OutputFormat[OutputFormat.Detailed]);
  // config.setServiceProperty(PropertyId.SpeechServiceResponse_RequestDetailedResultTrueFalse, "true", ServicePropertyChannel.UriQueryParameter);

  const dialogServiceConnector = patchDialogServiceConnectorInline(new DialogServiceConnector(config, audioConfig));

  dialogServiceConnector.connect();

  const directLine = new DirectLineSpeech({ dialogServiceConnector });

  const webSpeechPonyfillFactory = createWebSpeechPonyfillFactory({
    audioConfig,
    audioContext,
    enableTelemetry,
    recognizer: dialogServiceConnector,
    speechRecognitionEndpointId,
    speechSynthesisDeploymentId,
    speechSynthesisOutputFormat,
    textNormalization
  });

  return {
    directLine,
    webSpeechPonyfillFactory
  };
}
