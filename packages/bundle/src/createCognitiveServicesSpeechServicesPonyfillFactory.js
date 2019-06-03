import createPonyfill from 'web-speech-cognitive-services/lib/SpeechServices';

function injectReferenceGrammarID({ SpeechGrammarList, SpeechRecognition }, referenceGrammarID) {
  return class extends SpeechRecognition {
    start() {
      this.grammars = new SpeechGrammarList();
      this.grammars.referenceGrammar = referenceGrammarID || '';

      return super.start();
    }
  };
}

export default async function createCognitiveServicesSpeechServicesPonyfillFactory({
  authorizationToken,
  region,
  subscriptionKey,
  textNormalization
}) {
  console.warn(
    'Web Chat: Cognitive Services Speech Services support is currently in preview. If you encounter any problems, please file us an issue at https://github.com/Microsoft/BotFramework-WebChat/issues/.'
  );

  const ponyfill = await createPonyfill({
    authorizationToken,
    region,
    subscriptionKey,
    textNormalization
  });

  const { SpeechGrammarList, speechSynthesis, SpeechSynthesisUtterance } = ponyfill;

  return ({ referenceGrammarID }) => ({
    SpeechGrammarList,
    SpeechRecognition: injectReferenceGrammarID(ponyfill, referenceGrammarID),
    speechSynthesis,
    SpeechSynthesisUtterance
  });
}
