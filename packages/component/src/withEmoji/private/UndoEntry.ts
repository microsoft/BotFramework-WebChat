export default class UndoEntry {
  constructor(value: string, selectionStart: number | null, selectionEnd: number | null, reason: string) {
    this.#reason = reason;
    this.#selectionEnd = selectionEnd;
    this.#selectionStart = selectionStart;
    this.#value = value;
  }

  #reason: string;
  #selectionEnd: number | null;
  #selectionStart: number | null;
  #value: string;

  get reason(): string {
    return this.#reason;
  }

  get selectionStart(): number | null {
    return this.#selectionStart;
  }

  get selectionEnd(): number | null {
    return this.#selectionEnd;
  }
  get value(): string {
    return this.#value;
  }

  // TODO: Remove this.
  toString(): string {
    const tokens = this.value.split('');

    if (this.selectionStart === this.selectionEnd) {
      tokens.splice(this.selectionStart, 0, '|');
    } else {
      tokens.splice(this.selectionEnd, 0, ']');
      tokens.splice(this.selectionStart, 0, '[');
    }

    return `${tokens.join('')} (${this.reason})`;
  }
}
