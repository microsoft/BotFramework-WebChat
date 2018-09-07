import {
  SpeechGrammarList,
  SpeechRecognition
} from 'web-speech-cognitive-services';

export default ({ referenceGrammarId, speechToken }) => {
  return class extends SpeechRecognition {
    constructor() {
      super();

      this.speechToken = speechToken;
    }

    start() {
      this.grammars = new SpeechGrammarList();
      this.grammars.referenceGrammar = referenceGrammarId;

      return super.start();
    }
  };
}
