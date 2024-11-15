import type { Extension } from 'micromark-util-types';
import { BACKSLASH, DOLLAR } from './constants';
import { createTokenizer } from './tokenizer';

export default function math(): Extension {
  const construct = {
    name: 'math',
    tokenize: createTokenizer
  };

  return {
    text: {
      [BACKSLASH]: construct
    },
    flow: {
      [BACKSLASH]: construct,
      [DOLLAR]: construct
    }
  } as any;
}
