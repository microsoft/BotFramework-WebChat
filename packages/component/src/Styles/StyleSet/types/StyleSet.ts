type StyleSet = Partial<CSSStyleDeclaration> & {
  [key: `${'@container ' | '@media ' | '&'}${string}`]: StyleSet;
  [key: `--${string}`]: string;
};

export { type StyleSet };
