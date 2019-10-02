import createPonyfill from 'web-speech-cognitive-services/lib/BingSpeech';

function injectReferenceGrammarID({ SpeechGrammarList, SpeechRecognition }, referenceGrammarID) {
  return class extends SpeechRecognition {
    start() {
      this.grammars = new SpeechGrammarList();
      this.grammars.referenceGrammar = referenceGrammarID || '';

      return super.start();
    }
  };
}

export default async function createCognitiveServicesBingSpeechPonyfillFactory({
  authorizationToken,
  subscriptionKey
}) {
  const ponyfill = await createPonyfill({ authorizationToken, subscriptionKey });
  const { SpeechGrammarList, speechSynthesis, SpeechSynthesisUtterance } = ponyfill;

  return ({ referenceGrammarID }) => ({
    SpeechGrammarList,
    SpeechRecognition: injectReferenceGrammarID(ponyfill, referenceGrammarID),
    speechSynthesis,
    SpeechSynthesisUtterance
  });
}
