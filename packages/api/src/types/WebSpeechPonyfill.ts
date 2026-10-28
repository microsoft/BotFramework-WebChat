/* globals SpeechSynthesis */

// `SpeechGrammarList` and `SpeechRecognition` are not in TypeScript's DOM library, they come from `@types/dom-speech-recognition`.
// Look them up on `globalThis`, so consumers without these global types do not get "Cannot find name" in our typings.
// Use `typeof SpeechGrammarList`/`typeof SpeechRecognition` again when TypeScript's DOM library includes them.
type SpeechGrammarListConstructor = typeof globalThis extends { SpeechGrammarList: infer T } ? T : new () => object;
type SpeechRecognitionConstructor = typeof globalThis extends { SpeechRecognition: infer T } ? T : new () => object;

type WebSpeechPonyfill = {
  /**
   * Function to resume `AudioContext` object when called.
   *
   * Web Chat will call this function on user gestures to resume suspended `AudioContext`.
   */
  resumeAudioContext?: () => Promise<void>;

  /** Polyfill for Web Speech API `SpeechGrammarList` class. */
  SpeechGrammarList?: SpeechGrammarListConstructor;

  /** Polyfill for Web Speech API `SpeechRecognition` class. */
  SpeechRecognition?: SpeechRecognitionConstructor;

  /** Polyfill for Web Speech API `speechSynthesis` instance. */
  speechSynthesis?: SpeechSynthesis;

  /** Polyfill for Web Speech API `SpeechSynthesisUtterance` class. */
  SpeechSynthesisUtterance?: typeof SpeechSynthesisUtterance;
};

export { type WebSpeechPonyfill };
