type StyleSet = Partial<CSSStyleDeclaration> & { [key: `&${string}`]: StyleSet };

export { type StyleSet };
