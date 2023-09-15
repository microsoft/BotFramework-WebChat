export default class SelectionAndValue {
  constructor(value: string, selectionStart: number | null, selectionEnd: number | null) {
    this.#selectionEnd = selectionEnd;
    this.#selectionStart = selectionStart;
    this.#value = value;
  }

  #value: string;
  #selectionEnd: number | null;
  #selectionStart: number | null;

  get value(): string {
    return this.#value;
  }

  get selectionEnd(): number | null {
    return this.#selectionEnd;
  }

  get selectionStart(): number | null {
    return this.#selectionStart;
  }
}
