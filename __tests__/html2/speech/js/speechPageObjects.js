/* eslint-env browser */

import {
  SpeechGrammarList,
  SpeechRecognition,
  SpeechRecognitionAlternative,
  SpeechRecognitionEvent,
  SpeechRecognitionResult,
  SpeechRecognitionResultList
} from 'react-dictate-button/internal';
import { fn, spyOn } from 'jest-mock';
import SpeechSynthesisEvent from './MockedSpeechSynthesisEvent.js';

function createWebSpeechPonyfill() {
  return {
    SpeechGrammarList,
    SpeechRecognition: fn().mockImplementation(() => new SpeechRecognition()),
    speechSynthesis,
    SpeechSynthesisUtterance
  };
}

async function actSpeakOnce({ speechSynthesis }, actor) {
  let lastUtterance;

  spyOn(speechSynthesis, 'speak').mockImplementationOnce(utterance => {
    lastUtterance = utterance;

    utterance.dispatchEvent(new SpeechSynthesisEvent('end', { utterance }));
  });

  await actor();

  return lastUtterance;
}

async function actRecognizeOnce(ponyfill, text, actor) {
  const OriginalSpeechRecognition = ponyfill.SpeechRecognition;

  spyOn(ponyfill, 'SpeechRecognition').mockImplementationOnce(() => {
    const speechRecognition = new OriginalSpeechRecognition();

    spyOn(speechRecognition, 'abort');
    spyOn(speechRecognition, 'start').mockImplementationOnce(() => {
      speechRecognition.dispatchEvent(new Event('start'));
      speechRecognition.dispatchEvent(new Event('audiostart'));
      speechRecognition.dispatchEvent(new Event('soundstart'));
      speechRecognition.dispatchEvent(new Event('speechstart'));

      speechRecognition.dispatchEvent(
        new SpeechRecognitionEvent('result', {
          results: new SpeechRecognitionResultList(
            SpeechRecognitionResult.fromFinalized(new SpeechRecognitionAlternative(1.0, text))
          )
        })
      );

      speechRecognition.dispatchEvent(new Event('speechend'));
      speechRecognition.dispatchEvent(new Event('soundend'));
      speechRecognition.dispatchEvent(new Event('audioend'));
      speechRecognition.dispatchEvent(new Event('end'));
    });

    return speechRecognition;
  });

  await actor();
}

export { actRecognizeOnce, actSpeakOnce, createWebSpeechPonyfill };
