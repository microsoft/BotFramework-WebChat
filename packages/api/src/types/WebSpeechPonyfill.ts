/* globals SpeechSynthesis */

import { type TypeOfGlobal } from '@msinternal/botframework-webchat-base/utils';

// `SpeechGrammarList` and `SpeechRecognition` are not in TypeScript's DOM library, they come from `@types/dom-speech-recognition`.
// Use `typeof SpeechGrammarList`/`typeof SpeechRecognition` again when TypeScript's DOM library includes them.

type WebSpeechPonyfill = {
  /**
   * Function to resume `AudioContext` object when called.
   *
   * Web Chat will call this function on user gestures to resume suspended `AudioContext`.
   */
  resumeAudioContext?: () => Promise<void>;

  /** Polyfill for Web Speech API `SpeechGrammarList` class. */
  SpeechGrammarList?: TypeOfGlobal<'SpeechGrammarList', new () => object>;

  /** Polyfill for Web Speech API `SpeechRecognition` class. */
  SpeechRecognition?: TypeOfGlobal<'SpeechRecognition', new () => object>;

  /** Polyfill for Web Speech API `speechSynthesis` instance. */
  speechSynthesis?: SpeechSynthesis;

  /** Polyfill for Web Speech API `SpeechSynthesisUtterance` class. */
  SpeechSynthesisUtterance?: typeof SpeechSynthesisUtterance;
};

export { type WebSpeechPonyfill };
