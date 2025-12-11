import { EventTargetProperties } from 'https://esm.sh/event-target-properties';
import SpeechSynthesisEvent from './MockedSpeechSynthesisEvent.js';

export default class SpeechSynthesis extends EventTarget {
  constructor() {
    super();

    this.#eventTargetProperties = new EventTargetProperties(this);
  }

  /** @type {SpeechSynthesisUtterance} */
  #currentUtterance;
  /** @type {EventTargetProperties} */
  #eventTargetProperties;
  /** @type {boolean} */
  #paused = false;
  // #pending = false;
  /** @type {SpeechSynthesisUtterance[]} */
  #queue = [];
  /** @type {boolean} */
  #speaking = false;

  get onvoiceschanged() {
    return this.#eventTargetProperties.getProperty('voiceschanged');
  }

  set onvoiceschanged(value) {
    this.#eventTargetProperties.setProperty('voiceschanged', value);
  }

  /** @type {boolean} */
  get paused() {
    return this.#paused;
  }

  /** @type {boolean} */
  get pending() {
    return !!this.#queue.length;
  }

  /** @type {boolean} */
  get speaking() {
    return !this.paused && this.#speaking;
  }

  cancel() {
    this.#paused = false;
    this.#speaking = false;
    this.#queue.splice(0);

    this.#currentUtterance?.dispatchEvent(new SpeechSynthesisEvent('end', { utterance: this.#currentUtterance }));
  }

  getVoices() {
    return [];
  }

  pause() {
    if (this.#paused) {
      return;
    }

    this.#paused = true;

    this.#currentUtterance?.dispatchEvent(new SpeechSynthesisEvent('pause', { utterance: this.#currentUtterance }));
  }

  resume() {
    if (!this.#paused) {
      return;
    }

    this.#paused = false;

    if (this.#currentUtterance) {
      this.#currentUtterance.dispatchEvent(new SpeechSynthesisEvent('resume', { utterance: this.#currentUtterance }));
    } else {
      this.#next();
    }
  }

  speak(/** @type {SpeechSynthesisUtterance} */ utterance) {
    this.#queue.push(/** @type {SpeechSynthesisUtterance} */ utterance);

    !this.#paused && !this.#speaking && this.#next();
  }

  #next() {
    if (this.#paused) {
      throw new Error('Should not call #next() when it is paused.');
    }

    this.#currentUtterance = this.#queue.shift();

    if (!this.#currentUtterance) {
      this.#paused = false;
      this.#speaking = false;

      return;
    }

    this.#speaking = true;

    this.#currentUtterance.addEventListener('end', () => this.#next(), { once: true });
    this.#currentUtterance.addEventListener(
      'error',
      () => {
        this.#paused = false;
        this.#speaking = false;
        this.#queue.splice(0);
      },
      { once: true }
    );

    this.#currentUtterance.dispatchEvent(new SpeechSynthesisEvent('start', { utterance: this.#currentUtterance }));
  }
}
