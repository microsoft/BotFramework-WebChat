declare module 'jspeech' {
  interface JSpeech implements Rule {
    public: Rule;
    stringify(): string;
  }

  interface Rule {
    rule: (name, rule) => void;
  }

  export default function (name: string): JSpeech;
}
