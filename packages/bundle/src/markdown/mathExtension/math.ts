import type { Extension } from 'micromark-util-types';
import { BACKSLASH, CLOSE_BRACKET, CLOSE_PAREN, DOLLAR, OPEN_BRACKET, OPEN_PAREN } from './constants';
import makeConstructTokenizer from './tokenizer';

export default function math(): Extension {
  const makeConstruct = (...args: Parameters<typeof makeConstructTokenizer>) => ({
    name: 'math',
    tokenize: makeConstructTokenizer(...args)
  });

  return {
    text: {
      [BACKSLASH]: makeConstruct({ OPEN_CODE: OPEN_PAREN, CLOSE_CODE: CLOSE_PAREN })
    },
    flow: {
      [BACKSLASH]: makeConstruct({ OPEN_CODE: OPEN_BRACKET, CLOSE_CODE: CLOSE_BRACKET }),
      [DOLLAR]: makeConstruct({ OPEN_CODE: DOLLAR, CLOSE_CODE: DOLLAR })
    }
  } as any;
}
