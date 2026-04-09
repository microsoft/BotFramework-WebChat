/* eslint-disable security/detect-object-injection */
/*!
 * Copyright (C) Microsoft Corporation. All rights reserved.
 */

const NextLivestreamSequence = Symbol();
const PreviousActivitySymbol = Symbol();
const SessionIdSymbol = Symbol();

export default class LivestreamSession {
  constructor(sessionId) {
    this[NextLivestreamSequence] = 1;
    this[PreviousActivitySymbol] = undefined;
    this[SessionIdSymbol] = sessionId;
  }

  /**
   * Last string, useful for decompressing delta-compressed chunks.
   */
  get previousActivity() {
    return this[PreviousActivitySymbol];
  }

  set previousActivity(value) {
    this[PreviousActivitySymbol] = value;
  }

  /**
   * Activity ID of the session (and the first activity.)
   *
   * @type {string}
   */
  get sessionId() {
    return this[SessionIdSymbol];
  }

  get isConcluded() {
    return this[NextLivestreamSequence] === Infinity;
  }

  /** @return {number} */
  getNextLivestreamSequence(
    /** @type {boolean | undefined} */
    isFinal = false
  ) {
    if (isFinal) {
      this.previousActivity = undefined;

      return (this[NextLivestreamSequence] = Infinity);
    }

    return this[NextLivestreamSequence]++;
  }
}
