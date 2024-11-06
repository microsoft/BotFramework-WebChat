import { BACKSLASH } from './constants';
import { createTokenizer } from './tokenizer';
import { type Extension } from 'micromark-util-types';

export function math(): Extension {
  const construct = {
    name: 'math',
    tokenize: createTokenizer
  };

  return {
    text: { [BACKSLASH]: construct },
    flow: { [BACKSLASH]: construct }
  } as any;
}

export { type CreateHtmlRendererOptions as mathHtmlOptions, default as mathHtml } from './htmlRenderer';
