import createPonyfill from 'web-speech-cognitive-services/lib/SpeechServices';

export default async ({ authorizationToken, region, subscriptionKey }) => {
  const ponyfill = await createPonyfill({ authorizationToken, region, subscriptionKey });
  const {
    SpeechGrammarList,
    speechSynthesis,
    SpeechSynthesisUtterance
  } = ponyfill;

  return ({ referenceGrammarID }) => ({
    SpeechGrammarList,
    SpeechRecognition: injectReferenceGrammarID(ponyfill, referenceGrammarID),
    speechSynthesis,
    SpeechSynthesisUtterance
  });
};

function injectReferenceGrammarID({ SpeechGrammarList, SpeechRecognition }, referenceGrammarID) {
  return class extends SpeechRecognition {
    start() {
      this.grammars = new SpeechGrammarList();
      this.grammars.referenceGrammar = referenceGrammarID || '';

      return super.start();
    }
  };
}
