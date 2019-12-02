import {
  BotFrameworkConfig,
  DialogServiceConnector,
  PropertyId,
  ServicePropertyChannel
} from 'microsoft-cognitiveservices-speech-sdk';

import createWebSpeechPonyfillFactory from './createWebSpeechPonyfillFactory';
import DirectLineSpeech from './DirectLineSpeech';
import patchDialogServiceConnectorInline from './patchDialogServiceConnectorInline';

export default async function create({
  audioConfig,
  audioContext,
  enableTelemetry,
  fetchCredentials,
  speechRecognitionEndpointId,
  speechRecognitionLanguage = (typeof window !== 'undefined' &&
    typeof window.navigator !== 'undefined' &&
    window.navigator.language) ||
    'en-US',
  speechSynthesisDeploymentId,
  speechSynthesisOutputFormat,
  textNormalization,
  userID,
  username
}) {
  const { authorizationToken, region, subscriptionKey } = await fetchCredentials();

  if ((!authorizationToken && !subscriptionKey) || (authorizationToken && subscriptionKey)) {
    throw new Error('"fetchCredentials" must return either "authorizationToken" or "subscriptionKey" only.');
  }

  if (!region) {
    throw new Error('"fetchCredentials" must return "region".');
  }

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
      'botframework-directlinespeech: Synthesis output format is currently not supported, ignoring speechSynthesisOutputFormat.'
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

  if (authorizationToken) {
    config = BotFrameworkConfig.fromAuthorizationToken(authorizationToken, region);

    // TODO: Renew token
  } else {
    config = BotFrameworkConfig.fromSubscription(subscriptionKey, region);
  }

  // Supported options can be found in DialogConnectorFactory.js.

  config.setProperty(PropertyId.SpeechServiceConnection_RecoLanguage, speechRecognitionLanguage);

  // None of the following works for setting output format.

  // config.setProperty(PropertyId.SpeechServiceResponse_OutputFormatOption, OutputFormat[OutputFormat.Detailed]);
  // config.setProperty(PropertyId.SpeechServiceResponse_RequestDetailedResultTrueFalse, true);
  // config.setProperty(OutputFormatPropertyName, OutputFormat[OutputFormat.Detailed]);
  // config.setServiceProperty(PropertyId.SpeechServiceResponse_RequestDetailedResultTrueFalse, "true", ServicePropertyChannel.UriQueryParameter);

  // The following code is copied from C#, it should set from.id, but it did not.
  // https://github.com/Azure-Samples/Cognitive-Services-Direct-Line-Speech-Client/blob/master/DLSpeechClient/MainWindow.xaml.cs#L236
  userID && config.setProperty(PropertyId.Conversation_From_Id, userID);

  // The following code is copied from C#, and it is not working yet.
  // https://github.com/Azure-Samples/Cognitive-Services-Direct-Line-Speech-Client/blob/master/DLSpeechClient/MainWindow.xaml.cs
  // speechRecognitionEndpointId && config.setServiceProperty('cid', speechRecognitionEndpointId, ServicePropertyChannel.UriQueryParameter);
  // speechSynthesisDeploymentId && config.setProperty(PropertyId.conversation_Custom_Voice_Deployment_Ids, speechSynthesisDeploymentId);

  const dialogServiceConnector = patchDialogServiceConnectorInline(new DialogServiceConnector(config, audioConfig));

  dialogServiceConnector.connect();

  const directLine = new DirectLineSpeech({ dialogServiceConnector });

  const webSpeechPonyfillFactory = createWebSpeechPonyfillFactory({
    audioConfig,
    audioContext,
    enableTelemetry,
    recognizer: dialogServiceConnector,
    textNormalization
  });

  return {
    directLine,
    webSpeechPonyfillFactory
  };
}
