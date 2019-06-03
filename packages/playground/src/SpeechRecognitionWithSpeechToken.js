import { SpeechRecognition } from 'web-speech-cognitive-services';

export default speechToken => {
  return class extends SpeechRecognition {
    constructor() {
      super();

      this.speechToken = speechToken;
    }
  };
};
