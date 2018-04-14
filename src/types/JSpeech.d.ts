declare module 'jspeech' {
  interface JSpeech implements Rule {
    public: Rule;
    stringify(): string;
  }

  interface Rule {
    rule: function(name, rule);
  }

  export default function (name: string): JSpeech;
}
