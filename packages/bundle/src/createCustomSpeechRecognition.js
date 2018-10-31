import {
  SpeechGrammarList,
  SpeechRecognition
} from 'web-speech-cognitive-services';

export default ({ fetchToken, referenceGrammarID }) => {
  return class extends SpeechRecognition {
    constructor() {
      super();

      this.fetchToken = fetchToken;
    }

    start() {
      this.grammars = new SpeechGrammarList();
      this.grammars.referenceGrammar = referenceGrammarID || '';

      return super.start();
    }
  };
}
