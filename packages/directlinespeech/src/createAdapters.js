/* eslint complexity: ["error", 30] */

import { AudioConfig } from 'microsoft-cognitiveservices-speech-sdk/distrib/lib/src/sdk/Audio/AudioConfig';
import { BotFrameworkConfig, DialogServiceConnector, PropertyId } from 'microsoft-cognitiveservices-speech-sdk';

import createWebSpeechPonyfillFactory from './createWebSpeechPonyfillFactory';
import DirectLineSpeech from './DirectLineSpeech';
import patchDialogServiceConnectorInline from './patchDialogServiceConnectorInline';
import resolveFunctionOrReturnValue from './resolveFunctionOrReturnValue';
import refreshDirectLineToken from './utils/refreshDirectLineToken';

const TOKEN_RENEWAL_INTERVAL = 120000;
const DIRECTLINE_TOKEN_RENEWAL_INTERVAL = (30 * 60 * 1000) / 2;

export default async function create({
  audioConfig,
  audioContext,
  audioInputDeviceId,
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
  username,
  useHttpPath = false
}) {
  if (!fetchCredentials) {
    throw new Error('"fetchCredentials" must be specified.');
  }

  const { authorizationToken, region, subscriptionKey, directLineToken } = await resolveFunctionOrReturnValue(fetchCredentials);
  
  if (
    (!authorizationToken && !subscriptionKey) ||
    (authorizationToken && subscriptionKey) ||
    (authorizationToken && typeof authorizationToken !== 'string') ||
    (subscriptionKey && typeof subscriptionKey !== 'string') ||
    (useHttpPath && !directLineToken)
  ) {
    throw new Error(
      '"fetchCredentials" must return either "authorizationToken" or "subscriptionKey" as a non-empty string only. If useHttpPath = true, then it should also return a directLineToken'
    );
  }


  if (typeof enableTelemetry !== 'undefined') {
    console.warn(
      'botframework-directlinespeech: Telemetry options are not yet supported. Please refer to Cognitive Services documentation for details.'
    );
  }

  if (!region || typeof region !== 'string') {
    throw new Error('"fetchCredentials" must return "region" as a non-empty string.');
  }

  if (audioConfig && audioInputDeviceId) {
    console.warn(
      'botframework-directlinespeech-sdk: Only "audioConfig" or "audioInputDeviceId" can be specified, but not both; ignoring "audioInputDeviceId".'
    );
  } else if (!audioConfig) {
    if (audioInputDeviceId) {
      audioConfig = AudioConfig.fromMicrophoneInput(audioInputDeviceId);
    } else {
      audioConfig = AudioConfig.fromDefaultMicrophoneInput();
    }
  }

  if (speechRecognitionEndpointId) {
    console.warn(
      'botframework-directlinespeech: Custom Speech is currently not supported; ignoring "speechRecognitionEndpointId".'
    );
  }

  if (speechSynthesisDeploymentId) {
    console.warn(
      'botframework-directlinespeech: Custom Voice is currently not supported; ignoring "speechSynthesisDeploymentId".'
    );
  }

  if (speechSynthesisOutputFormat) {
    console.warn(
      'botframework-directlinespeech: Synthesis output format is currently not supported; ignoring "speechSynthesisOutputFormat".'
    );
  }

  if (textNormalization) {
    console.warn(
      'botframework-directlinespeech: Text normalization is currently not supported; ignoring "textNormalization".'
    );
  }

  if (userID || username) {
    console.warn(
      'botframework-directlinespeech: Custom "userId" and "username" are currently not supported and are ignored.'
    );
  }

  let config;

  if (authorizationToken) {
    config = BotFrameworkConfig.fromAuthorizationToken(authorizationToken, region);
  } else {
    config = BotFrameworkConfig.fromSubscription(subscriptionKey, region);
  }

  // switch to direct line endpoint on DLS service.
  if (useHttpPath) {
     const endpoint = config.getProperty("SPEECH-Endpoint").replace("api/v3", "directline/api/v1")
     config.setProperty("SPEECH-Endpoint", endpoint)
     config.setProperty(PropertyId.Conversation_ApplicationId, directLineToken.token)
  }
  // Supported options can be found in DialogConnectorFactory.js.

  // Set the language used for recognition.
  config.setProperty(PropertyId.SpeechServiceConnection_RecoLanguage, speechRecognitionLanguage);

  // The following code sets the output format.
  // As advised by the Speech team, this API may be subject to future changes.
  // We are not enabling output format option because it does not send detailed output format to the bot, rendering this option useless.
  // config.setProperty(PropertyId.SpeechServiceResponse_OutputFormatOption, OutputFormat[OutputFormat.Detailed]);

  // Set the user ID for starting the conversation.
  userID && config.setProperty(PropertyId.Conversation_From_Id, userID);

  // Set Custom Speech and Custom Voice.
  // The following code is copied from C#, and it is not working yet.
  // https://github.com/Azure-Samples/Cognitive-Services-Direct-Line-Speech-Client/blob/master/DLSpeechClient/MainWindow.xaml.cs
  // speechRecognitionEndpointId && config.setServiceProperty('cid', speechRecognitionEndpointId, ServicePropertyChannel.UriQueryParameter);
  // speechSynthesisDeploymentId && config.setProperty(PropertyId.conversation_Custom_Voice_Deployment_Ids, speechSynthesisDeploymentId);

  const dialogServiceConnector = patchDialogServiceConnectorInline(new DialogServiceConnector(config, audioConfig));

  dialogServiceConnector.connect();

  // Renew token per interval.
  if (authorizationToken) {
    const interval = setInterval(async () => {
      // #2660 If the connector has been disposed, we should stop renewing the token.

      // TODO: We should use a public implementation if Speech SDK has one related to "privIsDisposed".
      if (dialogServiceConnector.privIsDisposed) {
        clearInterval(interval);
      }

      const { authorizationToken, region: nextRegion } = await resolveFunctionOrReturnValue(fetchCredentials);

      if (!authorizationToken) {
        return console.warn(
          'botframework-directlinespeech-sdk: Renew token failed because "fetchCredentials" call returned no authorization token.'
        );
      }

      if (region !== nextRegion) {
        return console.warn(
          'botframework-directlinespeech-sdk: Region change is not supported for renewed token. Authorization token is not renewed.'
        );
      }

      dialogServiceConnector.authorizationToken = authorizationToken; // eslint-disable-line require-atomic-updates
    }, TOKEN_RENEWAL_INTERVAL);
  }

  // Renew token per interval.
  if (directLineToken) {
    const interval = setInterval(async () => {
      // #2660 If the connector has been disposed, we should stop renewing the token.

      // TODO: We should use a public implementation if Speech SDK has one related to "privIsDisposed".
      if (dialogServiceConnector.privIsDisposed) {
        clearInterval(interval);
      }

      const { refreshedDirectLineToken } = await refreshDirectLineToken(directLineToken);

      if (!refreshedDirectLineToken) {
        return console.warn(
          'botframework-directlinespeech-sdk: Renew token failed because call to refresh token Direct Line API did not return a new token.'
        );
      }

      dialogServiceConnector.BotFrameworkConfig.setProperty(PropertyId.Conversation_ApplicationId, refreshedDirectLineToken.token)
    }, DIRECTLINE_TOKEN_RENEWAL_INTERVAL);
  }

  const directLine = new DirectLineSpeech({ dialogServiceConnector });

  const webSpeechPonyfillFactory = createWebSpeechPonyfillFactory({
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
