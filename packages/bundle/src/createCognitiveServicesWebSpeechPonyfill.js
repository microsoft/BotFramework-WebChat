import {
  SpeechGrammarList,
  speechSynthesis,
  SpeechSynthesisUtterance
} from 'web-speech-cognitive-services';

import createSpeechRecognitionWithSpeechTokenClass from './Util/SpeechRecognitionWithSpeechToken';

export default function (fetchToken) {
  // TODO: Renew token as needed
  const token = {
    authorized: fetchToken
  };

  speechSynthesis.speechToken = token;

  return {
    SpeechGrammarList,
    SpeechRecognition: createSpeechRecognitionWithSpeechTokenClass(token),
    speechSynthesis,
    SpeechSynthesisUtterance
  };
}
