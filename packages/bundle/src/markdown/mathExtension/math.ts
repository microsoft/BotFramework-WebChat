import type { Extension } from 'micromark-util-types';
import { BACKSLASH, DOLLAR } from './constants';
import makeConstructTokenizer from './tokenizer';

export default function math(): Extension {
  const makeConstruct = (...args: Parameters<typeof makeConstructTokenizer>) => ({
    name: 'math',
    tokenize: makeConstructTokenizer(...args)
  });

  return {
    text: {
      [BACKSLASH]: makeConstruct(BACKSLASH),
      [DOLLAR]: makeConstruct(DOLLAR)
    },
    flow: {
      [BACKSLASH]: makeConstruct(BACKSLASH),
      [DOLLAR]: makeConstruct(DOLLAR)
    }
  } as any;
}
