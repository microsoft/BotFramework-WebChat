import SpeechSynthesisEvent from './MockedSpeechSynthesisEvent.js';

export default class SpeechSynthesisErrorEvent extends SpeechSynthesisEvent {
  constructor(
    /** @type {string} */
    type,
    /** @type {EventInitDict} */
    eventInitDict
  ) {
    super(type, eventInitDict);

    this.#error = eventInitDict.error;
  }

  /** @type {unknown} */
  #error;

  get error() {
    return this.#error;
  }
}
