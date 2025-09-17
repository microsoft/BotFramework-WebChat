import type { Construct, Extension } from 'micromark-util-types';
import { BACKSLASH, DOLLAR } from './constants';
import makeConstructTokenizer from './tokenizer';

export default function math(): Extension {
  const makeConstruct = (...args: Parameters<typeof makeConstructTokenizer>): Construct => ({
    name: 'math',
    // @ts-expect-error math is not known micromark token
    tokenize: makeConstructTokenizer(...args)
  });

  return {
    text: {
      [BACKSLASH]: makeConstruct(BACKSLASH, true),
      [DOLLAR]: makeConstruct(DOLLAR, true)
    },
    flow: {
      [BACKSLASH]: makeConstruct(BACKSLASH, false),
      [DOLLAR]: makeConstruct(DOLLAR, false)
    }
  };
}
