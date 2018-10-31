import {
  SpeechGrammarList,
  speechSynthesis,
  SpeechSynthesisUtterance
} from 'web-speech-cognitive-services';

import createCustomSpeechRecognitionClass from './createCustomSpeechRecognition';

export default function ({ fetchToken }) {
  return ({ referenceGrammarID }) => {
    speechSynthesis.fetchToken = fetchToken;

    return {
      SpeechGrammarList,
      SpeechRecognition: createCustomSpeechRecognitionClass({ fetchToken, referenceGrammarID }),
      speechSynthesis,
      SpeechSynthesisUtterance
    };
  }
}
