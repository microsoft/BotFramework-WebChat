/* eslint-disable no-magic-numbers */
/* eslint-disable @typescript-eslint/no-use-before-define */
import { BACKSLASH, OPEN_PAREN, CLOSE_PAREN, OPEN_BRACKET, CLOSE_BRACKET, DOLLAR } from './constants';
import { markdownLineEnding } from 'micromark-util-character';
import { type Code, type Effects, type State } from 'micromark-util-types';

type MathTokenTypes = 'math' | 'mathChunk';

type MathEffects = Omit<Effects, 'enter' | 'exit'> & {
  enter(type: MathTokenTypes): void;
  exit(type: MathTokenTypes): void;
};

export function createTokenizer(effects: MathEffects, ok: State, nok: State) {
  let expectedCloseDelimiter: number;
  let dollarDelimiterCount = 0;

  return start;

  function start(code: Code): State {
    if (code === BACKSLASH || code === DOLLAR) {
      effects.enter('math');
      effects.enter('mathChunk');
      effects.consume(code);
      dollarDelimiterCount = code === DOLLAR ? 1 : 0;
      return openDelimiter;
    }

    return nok(code);
  }

  function openDelimiter(code: Code): State {
    switch (code) {
      case OPEN_PAREN:
        expectedCloseDelimiter = CLOSE_PAREN;
        break;
      case OPEN_BRACKET:
        expectedCloseDelimiter = CLOSE_BRACKET;
        break;
      case DOLLAR:
        expectedCloseDelimiter = DOLLAR;
        dollarDelimiterCount++;
        if (dollarDelimiterCount !== 2) {
          return nok(code);
        }
        break;
      default:
        return nok(code);
    }
    effects.consume(code);
    return content;
  }

  function content(code: Code): State {
    if (code === null) {
      return nok(code);
    }

    if (code === BACKSLASH || (dollarDelimiterCount && code === DOLLAR)) {
      effects.consume(code);
      code === DOLLAR && dollarDelimiterCount--;
      return maybeCloseDelimiter;
    }

    effects.consume(code);

    if (markdownLineEnding(code)) {
      effects.exit('mathChunk');
      effects.enter('mathChunk');
    }

    return content;
  }

  function maybeCloseDelimiter(code: Code): State {
    if (code === expectedCloseDelimiter) {
      code === DOLLAR && dollarDelimiterCount--;
      if (dollarDelimiterCount !== 0) {
        return nok(code);
      }

      effects.consume(code);
      effects.exit('mathChunk');
      effects.exit('math');

      dollarDelimiterCount = 0;
      expectedCloseDelimiter = undefined;
      return ok;
    }

    return content(code);
  }
}
