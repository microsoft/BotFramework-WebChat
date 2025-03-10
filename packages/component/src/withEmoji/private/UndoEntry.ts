export default class UndoEntry {
  constructor(value: string, selectionStart: number | null, selectionEnd: number | null, group: string | undefined) {
    this.#group = group;
    this.#selectionEnd = selectionEnd;
    this.#selectionStart = selectionStart;
    this.#value = value;
  }

  #group: string | undefined;
  #selectionEnd: number | null;
  #selectionStart: number | null;
  #value: string;

  get group(): string | undefined {
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
}
