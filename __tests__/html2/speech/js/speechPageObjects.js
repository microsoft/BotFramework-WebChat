/* eslint-disable no-empty-function */
/* eslint-env browser */

import {
  SpeechGrammarList,
  SpeechRecognition,
  SpeechRecognitionAlternative,
  SpeechRecognitionErrorEvent,
  SpeechRecognitionEvent,
  SpeechRecognitionResult,
  SpeechRecognitionResultList
} from 'react-dictate-button/internal';
import { fn, spyOn } from 'jest-mock';
import SpeechSynthesis from './MockedSpeechSynthesis.js';
import SpeechSynthesisEvent from './MockedSpeechSynthesisEvent.js';

function createWebSpeechPonyfill() {
  const speechSynthesis = new SpeechSynthesis();

  return {
    SpeechGrammarList,
    SpeechRecognition: fn().mockImplementation(() => new SpeechRecognition()),
    speechSynthesis,
    SpeechSynthesisUtterance
  };
}

async function actSpeakOnce({ speechSynthesis }, actor, speakActor) {
  let lastUtterance;

  const originalSpeak = speechSynthesis.speak.bind(speechSynthesis);

  spyOn(speechSynthesis, 'speak').mockImplementationOnce(async utterance => {
    lastUtterance = utterance;

    originalSpeak(utterance);

    await speakActor?.(utterance);

    utterance.dispatchEvent(new SpeechSynthesisEvent('end', { utterance }));
  });

  await actor();

  return lastUtterance;
}

function actRecognizeOnce(ponyfill, actor, recognizeActor) {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async resolve => {
    const OriginalSpeechRecognition = ponyfill.SpeechRecognition;

    spyOn(ponyfill, 'SpeechRecognition').mockImplementationOnce(() => {
      const speechRecognition = new OriginalSpeechRecognition();

      let started = false;
      let audioStarted = false;
      let soundStarted = false;
      let speechStarted = false;

      const end = () => {
        started && speechRecognition.dispatchEvent(new Event('end'));
        started = false;
      };

      const audioEnd = () => {
        audioStarted && speechRecognition.dispatchEvent(new Event('audioend'));
        audioStarted = false;
      };

      const soundEnd = () => {
        soundStarted && speechRecognition.dispatchEvent(new Event('soundend'));
        soundStarted = false;
      };

      const speechEnd = () => {
        speechStarted && speechRecognition.dispatchEvent(new Event('speechend'));
        speechStarted = false;
      };

      const start = () => {
        started || speechRecognition.dispatchEvent(new Event('start'));
        started = true;
      };

      const audioStart = () => {
        audioStarted || speechRecognition.dispatchEvent(new Event('audiostart'));
        audioStarted = true;
      };

      const soundStart = () => {
        soundStarted || speechRecognition.dispatchEvent(new Event('soundstart'));
        soundStarted = true;
      };

      const speechStart = () => {
        speechStarted || speechRecognition.dispatchEvent(new Event('speechstart'));
        speechStarted = true;
      };

      const error = reason => {
        speechRecognition.dispatchEvent(new SpeechRecognitionErrorEvent('error', { error: reason }));
        started = true;
      };

      const result = text => {
        speechRecognition.dispatchEvent(
          new SpeechRecognitionEvent('result', {
            results: new SpeechRecognitionResultList(
              new SpeechRecognitionResult(new SpeechRecognitionAlternative(1.0, text))
            )
          })
        );
      };

      const finalizedResult = text => {
        speechRecognition.dispatchEvent(
          new SpeechRecognitionEvent('result', {
            results: new SpeechRecognitionResultList(
              SpeechRecognitionResult.fromFinalized(new SpeechRecognitionAlternative(1.0, text))
            )
          })
        );
      };

      spyOn(speechRecognition, 'abort').mockImplementationOnce(() => {
        speechEnd();
        soundEnd();
        audioEnd();
        error('aborted');
        end();
      });

      spyOn(speechRecognition, 'start').mockImplementationOnce(async () => {
        if (typeof recognizeActor === 'string') {
          start();
          audioStart();
          soundStart();
          speechStart();
          finalizedResult(recognizeActor);
          speechEnd();
          soundEnd();
          audioEnd();
          end();
        } else {
          await recognizeActor?.({
            start,
            audioStart,
            soundStart,
            speechStart,
            speechEnd,
            soundEnd,
            audioEnd,
            error,
            end,
            result,
            finalizedResult
          });
        }

        resolve();
      });

      return speechRecognition;
    });

    await actor();
  });
}

export { actRecognizeOnce, actSpeakOnce, createWebSpeechPonyfill };
