import {
  SpeechGrammarList,
  speechSynthesis,
  SpeechSynthesisUtterance
} from 'web-speech-cognitive-services';

import createCustomSpeechRecognitionClass from './createCustomSpeechRecognition';

export default function (fetchToken) {
  return ({ referenceGrammarId }) => {
    // TODO: [P1] Renew token as needed
    const speechToken = {
      authorized: fetchToken
    };

    speechSynthesis.speechToken = speechToken;

    return {
      SpeechGrammarList,
      SpeechRecognition: createCustomSpeechRecognitionClass({ referenceGrammarId, speechToken }),
      speechSynthesis,
      SpeechSynthesisUtterance
    };
  }
}
