export default class SpeechSynthesisEvent extends Event {
  constructor(
    /** @type {string} */
    type,
    /** @type {EventInitDict} */
    eventInitDict
  ) {
    super(type, eventInitDict);

    this.#charIndex = eventInitDict.charIndex || 0;
    this.#charLength = eventInitDict.charLength || 0;
    this.#elapsedTime = eventInitDict.elapsedTime || 0;
    this.#name = eventInitDict.name || '';
    this.#utterance = eventInitDict.utterance;
  }

  /** @type {number} */
  #charIndex;
  /** @type {number} */
  #charLength;
  /** @type {number} */
  #elapsedTime;
  /** @type {string} */
  #name;
  /** @type {SpeechSynthesisUtterance | undefined} */
  #utterance;

  get charIndex() {
    return this.#charIndex;
  }

  get charLength() {
    return this.#charLength;
  }

  get elapsedTime() {
    return this.#elapsedTime;
  }

  get name() {
    return this.#name;
  }

  get utterance() {
    return this.#utterance;
  }
}
