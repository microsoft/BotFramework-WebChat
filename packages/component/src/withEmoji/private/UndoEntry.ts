export default class UndoEntry {
  constructor(value: string, selectionStart: number | null, selectionEnd: number | null, group: string) {
    this.#group = group;
    this.#selectionEnd = selectionEnd;
    this.#selectionStart = selectionStart;
    this.#value = value;
  }

  #group: string;
  #selectionEnd: number | null;
  #selectionStart: number | null;
  #value: string;

  get group(): string {
    return this.#group;
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

    return `${tokens.join('')} (${this.group})`;
  }
}
