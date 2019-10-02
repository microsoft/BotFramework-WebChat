import createPonyfill from 'web-speech-cognitive-services/lib/SpeechServices';

export default function createCognitiveServicesSpeechServicesPonyfillFactory({
  authorizationToken,
  enableTelemetry,
  region,
  speechRecognitionEndpointId,
  speechSynthesisDeploymentId,
  speechSynthesisOutputFormat,
  subscriptionKey,
  textNormalization
}) {
  console.warn(
    'Web Chat: Cognitive Services Speech Services support is currently in preview. If you encounter any problems, please file us an issue at https://github.com/microsoft/BotFramework-WebChat/issues/.'
  );

  return ({ referenceGrammarID }) => {
    const ponyfill = createPonyfill({
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
